"""从公开源补全论文元数据。优先 DBLP，国内连不上时改走 OpenAlex / Crossref。仅教学用途。"""

import re
import time
from urllib.parse import quote
from xml.etree import ElementTree as ET

import requests
from requests.exceptions import SSLError

from config import (
    BATCH_SLEEP_SEC,
    CROSSREF_API,
    DBLP_MIRRORS,
    DBLP_TIMEOUT,
    OPENALEX_API,
    REQUEST_TIMEOUT,
    VENUES,
    YEAR_MAX,
    YEAR_MIN,
)
from keywords import extract_from_title

USER_AGENT = "SPECTRA-course-project/1.0 (teaching; DBLP+OpenAlex+Crossref)"
SESSION = requests.Session()
SESSION.headers.update({"User-Agent": USER_AGENT})


def normalize_title(title):
    text = (title or "").replace("$", " ")
    text = re.sub(r"\s+", " ", text).strip()
    return text


def map_venue(raw):
    text = (raw or "").upper()
    if "CVPR" in text or "COMPUTER VISION AND PATTERN RECOGNITION" in text:
        return "CVPR"
    if "ICCV" in text or "INTERNATIONAL CONFERENCE ON COMPUTER VISION" in text:
        return "ICCV"
    if "ECCV" in text or "EUROPEAN CONFERENCE ON COMPUTER VISION" in text:
        return "ECCV"
    return ""


def _paper(title, venue, year, link, source, abstract="", status=None):
    return {
        "title": normalize_title(title),
        "venue": venue,
        "year": year,
        "link": link,
        "source": source,
        "abstract": abstract or "",
        **({"status": status} if status else {}),
    }


PAYWALL_HINTS = (
    "ieeexplore.ieee.org",
    "doi.org/10.1109",
    "dx.doi.org/10.1109",
    "dl.acm.org",
    "link.springer.com",
)
OA_HINTS = (
    "arxiv.org",
    "openaccess.thecvf.com",
    "ecva.net",
    "openreview.net",
)


def _norm_key(text):
    return re.sub(r"[^a-z0-9]+", "", (text or "").lower())


def _is_paywall(url):
    text = (url or "").lower()
    return any(hint in text for hint in PAYWALL_HINTS)


def _is_oa(url):
    text = (url or "").lower()
    return any(hint in text for hint in OA_HINTS)


def _pick_best_url(urls):
    seen = []
    for url in urls:
        if not url or url in seen:
            continue
        seen.append(url)
    if not seen:
        return ""
    for url in seen:
        if _is_oa(url):
            return url
    for url in seen:
        if not _is_paywall(url):
            return url
    return seen[0]


def _cvf_title_slug(title):
    text = (title or "").replace(":", "")
    text = re.sub(r"[^\w\s\-]", "", text)
    return re.sub(r"\s+", "_", text).strip("_")


def _first_last_name(name):
    parts = [p for p in re.split(r"\s+", (name or "").strip()) if p]
    return parts[-1] if parts else ""


def _arxiv_id_from_url(url):
    found = re.search(r"arxiv\.org/(?:abs|pdf)/(\d{4}\.\d{4,5})", url or "", re.I)
    return found.group(1) if found else ""


def _clean_abs(text):
    text = re.sub(r"<[^>]+>", " ", text or "")
    text = re.sub(r"(?i)\babstract\s*:\s*", "", text)
    return re.sub(r"\s+", " ", text).strip()


def _title_close(left, right):
    a, b = _norm_key(left), _norm_key(right)
    if not a or not b:
        return False
    return a == b or a in b or b in a


_ARXIV_CACHE = {}


def lookup_arxiv(title, arxiv_id=""):
    query = normalize_title(title)
    key = arxiv_id or _norm_key(query)
    cached = _ARXIV_CACHE.get(key)
    if key and cached is not None:
        return cached or None
    params = {"max_results": 5}
    if arxiv_id:
        params["id_list"] = arxiv_id
    elif query:
        params["search_query"] = f'ti:"{query}"'
    else:
        return None
    ns = {"a": "http://www.w3.org/2005/Atom", "arxiv": "http://arxiv.org/schemas/atom"}
    entries = []
    try:
        resp = SESSION.get("http://export.arxiv.org/api/query", params=params, timeout=8)
        resp.raise_for_status()
        entries = ET.fromstring(resp.content).findall("a:entry", ns)
    except (requests.RequestException, ET.ParseError):
        entries = []
    if not entries and query and not arxiv_id:
        token = re.split(r"[:\s]", query, maxsplit=1)[0]
        try:
            resp = SESSION.get(
                "http://export.arxiv.org/api/query",
                params={"search_query": f"ti:{token}", "max_results": 8},
                timeout=8,
            )
            resp.raise_for_status()
            entries = ET.fromstring(resp.content).findall("a:entry", ns)
        except (requests.RequestException, ET.ParseError):
            entries = []
    picked = None
    for entry in entries:
        got = entry.findtext("a:title", default="", namespaces=ns)
        if arxiv_id or _title_close(query, got):
            picked = entry
            break
    if picked is None and arxiv_id and entries:
        picked = entries[0]
    if picked is None:
        if key:
            _ARXIV_CACHE[key] = {}
        return None
    ident = (picked.findtext("a:id", default="", namespaces=ns) or "").replace("http://", "https://")
    ident = re.sub(r"v\d+$", "", ident)
    if "arxiv.org/abs/" not in ident:
        if key:
            _ARXIV_CACHE[key] = {}
        return None
    author_el = picked.find("a:author", ns)
    comment = " ".join(
        filter(
            None,
            [
                picked.findtext("arxiv:comment", default="", namespaces=ns),
                picked.findtext("arxiv:journal_ref", default="", namespaces=ns),
            ],
        )
    )
    published = picked.findtext("a:published", default="", namespaces=ns) or ""
    year = int(published[:4]) if published[:4].isdigit() else 0
    found_year = re.search(r"(19|20)\d{2}", comment)
    if found_year:
        year = int(found_year.group(0))
    result = {
        "link": ident,
        "abstract": _clean_abs(picked.findtext("a:summary", default="", namespaces=ns)),
        "title": normalize_title(picked.findtext("a:title", default="", namespaces=ns)),
        "venue": map_venue(comment),
        "year": year,
        "first_author": author_el.findtext("a:name", default="", namespaces=ns) if author_el is not None else "",
    }
    if key:
        _ARXIV_CACHE[key] = result
    return result


def _arxiv_abs_link(title):
    hit = lookup_arxiv(title)
    return (hit or {}).get("link") or ""


def _lookup_first_author(title):
    query = normalize_title(title)
    if not query:
        return ""
    try:
        resp = SESSION.get(
            OPENALEX_API,
            params={"search": query, "per_page": 1},
            headers={"mailto": "course@localhost"},
            timeout=8,
        )
        resp.raise_for_status()
        works = (resp.json() or {}).get("results") or []
        authors = (works[0].get("authorships") if works else None) or []
        return ((authors[0].get("author") or {}).get("display_name") if authors else "") or ""
    except (requests.RequestException, ValueError, TypeError, IndexError):
        return ""


def _cvf_open_link(title, venue, year, first_author=""):
    if venue not in ("CVPR", "ICCV") or not year:
        return ""
    last = _first_last_name(first_author) or _first_last_name(_lookup_first_author(title))
    slug = _cvf_title_slug(title)
    if not last or not slug:
        return ""
    url = (
        f"https://openaccess.thecvf.com/content/{venue}{year}/html/"
        f"{last}_{slug}_{venue}_{year}_paper.html"
    )
    try:
        resp = SESSION.get(url, timeout=8, allow_redirects=True)
    except requests.RequestException:
        return ""
    if resp.status_code == 200 and len(resp.content) > 800:
        return url
    return ""


def resolve_open_link(title, venue="", year=0, candidates=None, first_author=""):
    urls = list(candidates or [])
    best = _pick_best_url(urls)
    text = (best or "").lower()
    if "openaccess.thecvf.com" in text or "ecva.net" in text:
        return best
    cvf = _cvf_open_link(title, venue, year, first_author)
    if cvf:
        return cvf
    if _is_oa(best):
        return best
    arxiv = _arxiv_abs_link(title)
    if arxiv:
        return arxiv
    return best


def upgrade_paywalled_papers():
    from store import list_papers, upsert_paper

    papers, _ = list_papers()
    for paper in papers:
        if paper.get("source") == "seed":
            continue
        current = paper.get("link") or ""
        if "openaccess.thecvf.com" in current.lower() or "ecva.net" in current.lower():
            continue
        better = resolve_open_link(
            paper["title"],
            paper.get("venue") or "",
            paper.get("year") or 0,
            [current],
        )
        if better and better != current:
            paper["link"] = better
            upsert_paper(paper, paper_id=paper["id"])


def _dblp_hit_to_paper(hit, fallback_title):
    info = hit.get("info") or {}
    title = normalize_title(info.get("title") or fallback_title)
    venue = map_venue(" ".join([str(info.get("venue") or ""), str(info.get("type") or "")]))
    try:
        year = int(str(info.get("year") or "0")[:4])
    except ValueError:
        year = 0
    urls = []
    ee = info.get("ee")
    if isinstance(ee, list):
        for item in ee:
            urls.append(item if isinstance(item, str) else str((item or {}).get("text") or ""))
    elif isinstance(ee, str):
        urls.append(ee)
    if info.get("url"):
        raw = info["url"]
        urls.append(raw if str(raw).startswith("http") else f"https://dblp.org/{raw}")
    authors = info.get("authors") or {}
    author = authors.get("author") if isinstance(authors, dict) else None
    if isinstance(author, list) and author:
        first = author[0]
    else:
        first = author
    first_name = first.get("text") if isinstance(first, dict) else (first or "")
    link = _pick_best_url(urls) or f"https://dblp.org/search?q={quote(title)}"
    paper = _paper(title, venue, year, link, "dblp")
    paper["first_author"] = first_name
    return paper


def _restore_abstract(inverted):
    if not inverted:
        return ""
    bag = []
    for word, positions in inverted.items():
        for pos in positions:
            bag.append((pos, word))
    bag.sort()
    return " ".join(w for _, w in bag)


def search_dblp(title):
    query = normalize_title(title)
    last_err = None
    for url in DBLP_MIRRORS:
        try:
            resp = SESSION.get(
                url,
                params={"q": query, "format": "json", "h": 8},
                timeout=DBLP_TIMEOUT,
            )
            resp.raise_for_status()
            hits = (((resp.json() or {}).get("result") or {}).get("hits") or {}).get("hit") or []
            if isinstance(hits, dict):
                hits = [hits]
            return [_dblp_hit_to_paper(h, query) for h in hits]
        except SSLError as exc:
            last_err = exc
            break
        except requests.RequestException as exc:
            last_err = exc
    if last_err:
        raise last_err
    return []


def search_openalex(title):
    query = normalize_title(title)
    resp = SESSION.get(
        OPENALEX_API,
        params={"search": query, "per_page": 5},
        headers={"mailto": "course@localhost"},
        timeout=REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    papers = []
    for work in (resp.json() or {}).get("results") or []:
        primary = work.get("primary_location") or {}
        source = primary.get("source") or {}
        chunks = [
            source.get("display_name"),
            primary.get("raw_source_name"),
            primary.get("landing_page_url"),
            (work.get("open_access") or {}).get("oa_url"),
            work.get("doi"),
        ]
        for loc in work.get("locations") or []:
            src = (loc or {}).get("source") or {}
            chunks.extend(
                [
                    src.get("display_name"),
                    (loc or {}).get("raw_source_name"),
                    (loc or {}).get("landing_page_url"),
                    (loc or {}).get("pdf_url"),
                ]
            )
        venue_raw = " ".join(filter(None, chunks))
        urls = [
            primary.get("pdf_url"),
            (work.get("open_access") or {}).get("oa_url"),
        ]
        for loc in work.get("locations") or []:
            urls.append((loc or {}).get("pdf_url"))
            urls.append((loc or {}).get("landing_page_url"))
        urls.append(work.get("doi"))
        urls.append(primary.get("landing_page_url"))
        authors = work.get("authorships") or []
        first_name = ((authors[0].get("author") or {}).get("display_name") if authors else "") or ""
        year = int(work.get("publication_year") or 0)
        paper = _paper(
            work.get("display_name") or query,
            map_venue(venue_raw),
            year,
            _pick_best_url(urls) or f"https://openalex.org/works?search={quote(query)}",
            "openalex",
            abstract=_restore_abstract(work.get("abstract_inverted_index") or {}),
        )
        paper["first_author"] = first_name
        papers.append(paper)
    return papers


def search_crossref(title):
    query = normalize_title(title)
    resp = SESSION.get(
        CROSSREF_API,
        params={"query.bibliographic": query, "rows": 5},
        timeout=REQUEST_TIMEOUT,
    )
    resp.raise_for_status()
    papers = []
    for item in ((resp.json() or {}).get("message") or {}).get("items") or []:
        names = item.get("title") or [query]
        container = " ".join(item.get("container-title") or [])
        event = ((item.get("event") or {}).get("name") or "")
        issued = ((item.get("issued") or {}).get("date-parts") or [[0]])[0]
        year = int(issued[0] or 0) if issued else 0
        doi = item.get("DOI") or ""
        link = item.get("URL") or (f"https://doi.org/{doi}" if doi else "")
        papers.append(
            _paper(
                names[0],
                map_venue(f"{container} {event} {link}"),
                year,
                link or f"https://search.crossref.org/?q={quote(query)}",
                "crossref",
                abstract=_clean_abs(item.get("abstract") or ""),
            )
        )
    return papers


def _scrape_html_abstract(url):
    if not url:
        return ""
    try:
        resp = SESSION.get(url, timeout=8)
        if resp.status_code != 200 or len(resp.text) < 80:
            return ""
    except requests.RequestException:
        return ""
    html = resp.text
    for pattern in (
        r'<blockquote[^>]*class="abstract"[^>]*>.*?</blockquote>',
        r'<div[^>]*id="abstract"[^>]*>.*?</div>',
        r'<div[^>]*class="abstract"[^>]*>.*?</div>',
    ):
        found = re.search(pattern, html, re.I | re.S)
        if found:
            text = _clean_abs(found.group(0))
            if len(text) > 40:
                return text
    return ""


def fetch_abstract(title, link=""):
    """OpenAlex 经常没有摘要；接着用 arXiv / Crossref / OA 页面补。"""
    arxiv_id = _arxiv_id_from_url(link)
    if arxiv_id:
        hit = lookup_arxiv(title, arxiv_id=arxiv_id)
        if hit and len(hit.get("abstract") or "") > 40:
            return hit["abstract"]
    try:
        hits = search_openalex(title)
    except (requests.RequestException, ValueError, TypeError):
        hits = []
    if hits and len((hits[0].get("abstract") or "")) > 40:
        return hits[0]["abstract"]
    hit = lookup_arxiv(title)
    if hit and len(hit.get("abstract") or "") > 40:
        return hit["abstract"]
    try:
        for item in search_crossref(title):
            if len((item.get("abstract") or "")) > 40:
                return item["abstract"]
    except (requests.RequestException, ValueError, TypeError):
        pass
    if _is_oa(link):
        scraped = _scrape_html_abstract(link)
        if scraped:
            return scraped
    return ""


def _pick_hit(hits):
    for hit in hits:
        if hit["venue"] in VENUES and YEAR_MIN <= hit["year"] <= YEAR_MAX:
            return hit
    if not hits:
        return None
    picked = dict(hits[0])
    if picked["venue"] not in VENUES:
        picked["venue"] = "CVPR"
        picked["status"] = "pending"
    if not (YEAR_MIN <= picked["year"] <= YEAR_MAX):
        picked["year"] = YEAR_MAX
        picked["status"] = "pending"
    return picked


def crawl_title(title):
    query = normalize_title(title)
    if not query:
        return None, "标题不能为空"

    hits = []
    for searcher in (search_dblp, search_openalex, search_crossref):
        try:
            hits = searcher(query)
        except requests.RequestException:
            hits = []
        if hits:
            break

    picked = _pick_hit(hits)
    if not picked:
        return None, "公开源暂时连不上。请检查网络后重试，或到论文库里手工添加。"

    arxiv = lookup_arxiv(picked["title"] or query)
    if arxiv:
        if arxiv.get("venue") in VENUES:
            picked["venue"] = arxiv["venue"]
        if YEAR_MIN <= (arxiv.get("year") or 0) <= YEAR_MAX:
            picked["year"] = arxiv["year"]
        if arxiv.get("first_author") and not picked.get("first_author"):
            picked["first_author"] = arxiv["first_author"]
        if len(arxiv.get("abstract") or "") > 40:
            picked["abstract"] = arxiv["abstract"]
    picked["link"] = resolve_open_link(
        picked["title"],
        picked.get("venue") or "",
        picked.get("year") or 0,
        [picked.get("link") or "", (arxiv or {}).get("link") or ""],
        picked.get("first_author") or "",
    )
    abstract = (picked.get("abstract") or "").strip()
    if len(abstract) < 40:
        abstract = fetch_abstract(picked["title"], picked.get("link") or "")
    picked.pop("first_author", None)
    picked["abstract"] = abstract or "（待补全）公开源未返回摘要，可在论文库中手工填写。"
    picked["keywords"] = extract_from_title(f"{picked['title']} {abstract[:500] if abstract else ''}")
    if abstract:
        picked["status"] = "complete"
    else:
        picked["status"] = picked.get("status") or "pending"
    return picked, None


def crawl_many(titles):
    papers = []
    errors = []
    for index, title in enumerate(titles):
        paper, err = crawl_title(title)
        if err:
            errors.append({"title": title, "error": err})
        else:
            papers.append(paper)
        if index != len(titles) - 1:
            time.sleep(BATCH_SLEEP_SEC)
    return papers, errors
