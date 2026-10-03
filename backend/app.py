"""SPECTRA Flask API：论文库、采集、热词统计。"""

import os

from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS

from config import MAX_IMPORT_ROWS, VENUES, YEAR_MAX, YEAR_MIN, YEARS
from crawl import crawl_many, crawl_title, normalize_title
from keywords import keyword_stats, paper_terms
from seed import SEED, seed_demo
from store import (
    delete_paper,
    find_by_title,
    get_paper,
    init_db,
    list_papers,
    toggle_star,
    upsert_paper,
)

app = Flask(__name__)
CORS(app)
init_db()
seed_demo()

DIST_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "..", "frontend", "dist"))


def parse_venues():
    raw = request.args.get("venues") or ",".join(VENUES)
    picked = [v.strip().upper() for v in raw.split(",") if v.strip()]
    return [v for v in picked if v in VENUES] or list(VENUES)


def parse_body():
    return request.get_json(silent=True) or {}


def validate_paper(data, partial=False):
    title = normalize_title(data.get("title") or "")
    venue = (data.get("venue") or "").upper()
    try:
        year = int(data.get("year") or 0)
    except (TypeError, ValueError):
        year = 0
    if not partial and not title:
        return None, "标题不能为空"
    if venue and venue not in VENUES:
        return None, "会议只支持 CVPR / ICCV / ECCV"
    if year and not (YEAR_MIN <= year <= YEAR_MAX):
        return None, f"年份必须在 {YEAR_MIN}–{YEAR_MAX}"
    keywords = data.get("keywords")
    if isinstance(keywords, str):
        keywords = [s.strip() for s in keywords.replace("，", ",").split(",") if s.strip()]
    payload = {
        "title": title,
        "venue": venue or "CVPR",
        "year": year or YEAR_MAX,
        "abstract": (data.get("abstract") or "").strip(),
        "keywords": keywords or [],
        "link": (data.get("link") or "").strip(),
        "source": data.get("source") or "manual",
        "status": data.get("status") or "complete",
    }
    if not payload["keywords"]:
        payload["keywords"] = paper_terms(payload)
    return payload, None


def build_stats(papers):
    ranked, edges = keyword_stats(papers)
    share = {v: len([p for p in papers if p.get("venue") == v]) for v in VENUES}
    return {
        "paperCount": len(papers),
        "keywordCount": len(ranked),
        "years": f"{YEAR_MIN}–{YEAR_MAX}",
        "share": share,
        "top": ranked[:10],
        "graph": {"nodes": ranked[:22], "edges": edges},
        "trend": ranked[:16],
        "all": ranked,
    }


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "years": YEARS, "venues": VENUES})


@app.get("/api/seed")
def api_seed():
    """只返回官方示意库，不带服务器上别人采过的论文。"""
    return jsonify({"papers": SEED, "count": len(SEED)})


@app.post("/api/normalize")
def api_normalize():
    payload, err = validate_paper(parse_body())
    if err:
        return jsonify({"error": err}), 400
    return jsonify(payload)


@app.get("/api/papers")
def api_list_papers():
    query = request.args.get("q") or ""
    year = request.args.get("year")
    papers, mode = list_papers(
        query=query, venues=parse_venues(), year=year, view=request.args.get("view") or "all"
    )
    return jsonify({"papers": papers, "total": len(papers), "mode": mode, "query": query})


@app.get("/api/papers/<paper_id>")
def api_get_paper(paper_id):
    paper = get_paper(paper_id)
    if not paper:
        return jsonify({"error": "未找到该论文"}), 404
    return jsonify(paper)


@app.post("/api/papers")
def api_create_paper():
    payload, err = validate_paper(parse_body())
    if err:
        return jsonify({"error": err}), 400
    if find_by_title(payload["title"]):
        return jsonify({"error": "论文库中已有相同标题"}), 409
    return jsonify(upsert_paper(payload)), 201


@app.put("/api/papers/<paper_id>")
def api_update_paper(paper_id):
    if not get_paper(paper_id):
        return jsonify({"error": "未找到该论文"}), 404
    payload, err = validate_paper(parse_body())
    if err:
        return jsonify({"error": err}), 400
    return jsonify(upsert_paper(payload, paper_id=paper_id))


@app.delete("/api/papers/<paper_id>")
def api_delete_paper(paper_id):
    if not delete_paper(paper_id):
        return jsonify({"error": "未找到该论文"}), 404
    return jsonify({"ok": True})


@app.route("/api/papers/<paper_id>/star", methods=["POST", "PUT"])
@app.post("/api/star/<paper_id>")
def api_star_paper(paper_id):
    paper = toggle_star(paper_id)
    if not paper:
        return jsonify({"error": "未找到该论文"}), 404
    return jsonify(paper)


@app.post("/api/crawl")
def api_crawl():
    body = parse_body()
    title = normalize_title(body.get("title") or "")
    write = bool(body.get("write"))
    paper, err = crawl_title(title)
    if err:
        return jsonify({"error": err}), 400
    existing = find_by_title(paper["title"])
    if write:
        saved = upsert_paper(paper, paper_id=existing["id"] if existing else None)
        return jsonify({"paper": saved, "written": True})
    return jsonify({"paper": paper, "written": False, "exists": bool(existing)})


@app.post("/api/crawl/batch")
def api_crawl_batch():
    body = parse_body()
    write = bool(body.get("write"))
    incoming = body.get("papers")
    if write and isinstance(incoming, list) and incoming:
        written = []
        for paper in incoming:
            payload, err = validate_paper(paper)
            if err:
                continue
            payload["source"] = paper.get("source") or payload["source"]
            payload["link"] = paper.get("link") or payload["link"]
            payload["abstract"] = paper.get("abstract") or payload["abstract"]
            existing = find_by_title(payload["title"])
            written.append(upsert_paper(payload, paper_id=existing["id"] if existing else None))
        return jsonify({"papers": written, "errors": [], "count": len(written), "written": True})
    raw = body.get("titles") or body.get("text") or ""
    if isinstance(raw, str):
        titles = [normalize_title(line) for line in raw.splitlines()]
    else:
        titles = [normalize_title(t) for t in raw]
    titles = [t for t in titles if t][:MAX_IMPORT_ROWS]
    if not titles:
        return jsonify({"error": "请提供标题列表"}), 400
    papers, errors = crawl_many(titles)
    if not write:
        preview = []
        for paper in papers:
            item = dict(paper)
            item["exists"] = bool(find_by_title(paper["title"]))
            preview.append(item)
        return jsonify({"papers": preview, "errors": errors, "count": len(preview), "written": False})
    written = []
    for paper in papers:
        existing = find_by_title(paper["title"])
        written.append(upsert_paper(paper, paper_id=existing["id"] if existing else None))
    return jsonify({"papers": written, "errors": errors, "count": len(written), "written": True})


def parse_client_papers(body):
    raw = body.get("papers") if isinstance(body, dict) else None
    if not isinstance(raw, list):
        return None
    papers = []
    for item in raw:
        if not isinstance(item, dict):
            continue
        payload, err = validate_paper(item)
        if err:
            continue
        payload["id"] = item.get("id") or payload["title"]
        papers.append(payload)
    return papers


@app.route("/api/stats", methods=["GET", "POST"])
def api_stats():
    body = parse_body() if request.method == "POST" else {}
    venues = body.get("venues") if request.method == "POST" else None
    if isinstance(venues, str):
        venues = [v.strip().upper() for v in venues.split(",") if v.strip()]
    elif not isinstance(venues, list) or not venues:
        venues = parse_venues()
    venues = [v for v in venues if v in VENUES] or list(VENUES)
    client = parse_client_papers(body) if request.method == "POST" else None
    if client is not None:
        papers = [p for p in client if p.get("venue") in venues]
    else:
        papers, _ = list_papers(venues=venues)
    return jsonify(build_stats(papers))


@app.route("/", defaults={"path": ""})
@app.route("/<path:path>")
def spa(path):
    """生产环境把 Vue 构建产物和 API 挂在同一端口，方便华为云只开一个服务。"""
    if path.startswith("api"):
        return jsonify({"error": "接口不存在"}), 404
    if not os.path.isdir(DIST_DIR):
        return jsonify({"ok": True, "ui": "dev", "hint": "本地请开 Vite 5173；上云先 npm run build"}), 200
    file_path = os.path.join(DIST_DIR, path)
    if path and os.path.isfile(file_path):
        return send_from_directory(DIST_DIR, path)
    return send_from_directory(DIST_DIR, "index.html")


if __name__ == "__main__":
    port = int(os.environ.get("PORT", "5000"))
    host = os.environ.get("SPECTRA_HOST", "127.0.0.1")
    debug = os.environ.get("FLASK_DEBUG", "1") != "0"
    app.run(host=host, port=port, debug=debug)
