"""关键词抽取与热度。口径写在函数注释里，博客需同步。"""

import re
from collections import defaultdict

from config import HEAT_ALPHA, VENUES, YEARS

STOPWORDS = {
    "a", "an", "the", "of", "for", "and", "or", "to", "in", "on", "with", "via",
    "from", "by", "at", "as", "is", "are", "using", "based", "towards", "toward",
    "into", "over", "under", "without", "within", "between", "through",
}

# 人工近义词表：不能全靠算法。短缩写必须整词匹配，避免 sam/vit 误伤 sample/vital。
SYNONYMS = {
    "cnn": "Convolution",
    "convolutional neural network": "Convolution",
    "vit": "Vision Transformer",
    "vision transformer": "Vision Transformer",
    "vision transformers": "Vision Transformer",
    "nerf": "Neural Radiance Fields",
    "nerfs": "Neural Radiance Fields",
    "neural radiance field": "Neural Radiance Fields",
    "neural radiance fields": "Neural Radiance Fields",
    "3dgs": "3D Gaussian Splatting",
    "3d gs": "3D Gaussian Splatting",
    "gaussian splat": "3D Gaussian Splatting",
    "gaussian splatting": "3D Gaussian Splatting",
    "3d gaussian splatting": "3D Gaussian Splatting",
    "llm": "Multimodal LLM",
    "vlm": "Multimodal LLM",
    "large language model": "Multimodal LLM",
    "vision language model": "Multimodal LLM",
    "multimodal llm": "Multimodal LLM",
    "sam": "Segment Anything",
    "segment anything": "Segment Anything",
    "segment anything model": "Segment Anything",
    "stable diffusion": "Diffusion Models",
    "latent diffusion": "Diffusion Models",
    "denoising diffusion": "Diffusion Models",
    "diffusion model": "Diffusion Models",
    "diffusion models": "Diffusion Models",
    "open vocabulary": "Open-Vocabulary",
    "open-vocabulary": "Open-Vocabulary",
    "self supervised": "Self-Supervised Learning",
    "self-supervised": "Self-Supervised Learning",
    "self-supervised learning": "Self-Supervised Learning",
    "foundation models": "Foundation Model",
    "foundation model": "Foundation Model",
    "world models": "World Model",
    "world model": "World Model",
    "novel view synthesis": "Novel View Synthesis",
    "neural rendering": "Neural Rendering",
    "object detection": "Object Detection",
    "semantic segmentation": "Semantic Segmentation",
    "instance segmentation": "Instance Segmentation",
    "pose estimation": "Pose Estimation",
    "depth estimation": "Depth Estimation",
    "3d reconstruction": "3D Reconstruction",
    "autonomous driving": "Autonomous Driving",
    "video generation": "Video Generation",
    "image restoration": "Image Restoration",
    "generative models": "Generative Models",
}

PHRASE_LEXICON = [
    "3D Gaussian Splatting",
    "Neural Radiance Fields",
    "Diffusion Models",
    "Vision Transformer",
    "Segment Anything",
    "Foundation Model",
    "Multimodal LLM",
    "World Model",
    "Video Generation",
    "Open-Vocabulary",
    "Autonomous Driving",
    "Self-Supervised Learning",
    "3D Reconstruction",
    "Object Detection",
    "Depth Estimation",
    "Generative Models",
    "Image Restoration",
    "Novel View Synthesis",
    "Neural Rendering",
    "Semantic Segmentation",
    "Instance Segmentation",
    "Pose Estimation",
]


def canon_keyword(raw):
    text = re.sub(r"\s+", " ", (raw or "").strip())
    if not text:
        return text
    return SYNONYMS.get(text.lower(), text)


def _alias_in_title(alias, lower):
    if len(alias) <= 3:
        return re.search(rf"\b{re.escape(alias)}\b", lower) is not None
    return alias in lower


def extract_from_title(title):
    """词表命中优先；只有词表与近义词都落空时才退回标题大写二元组。"""
    found = []
    blob = title or ""
    lower = blob.lower()
    for phrase in PHRASE_LEXICON:
        if re.search(re.escape(phrase), blob, flags=re.I):
            found.append(phrase)
    for alias, canon in SYNONYMS.items():
        if _alias_in_title(alias, lower) and canon not in found:
            found.append(canon)
    tokens = re.findall(r"[A-Za-z][A-Za-z0-9+\-]*", blob)
    kept = [t for t in tokens if t.lower() not in STOPWORDS and len(t) > 2]
    if not found:
        for i in range(len(kept) - 1):
            bigram = f"{kept[i]} {kept[i + 1]}"
            if kept[i][0].isupper() and kept[i + 1][0].isupper() and bigram not in found:
                if bigram.lower() not in STOPWORDS:
                    found.append(bigram)
    if not found and kept:
        found.append(" ".join(kept[:3]))
    uniq = []
    seen = set()
    for item in found:
        mapped = canon_keyword(item)
        key = mapped.lower()
        if key in seen:
            continue
        seen.add(key)
        uniq.append(mapped)
    return uniq[:6]


def paper_terms(paper):
    terms = [canon_keyword(k) for k in (paper.get("keywords") or []) if k]
    if terms:
        return terms
    return extract_from_title(paper.get("title") or "")


def _growth(series):
    recent = (series.get(2025) or 0) + (series.get(2026) or 0)
    older = (series.get(2022) or 0) + (series.get(2023) or 0) + (series.get(2024) or 0)
    if older == 0:
        return 1.0 if recent > 0 else 0.0
    return max(-1.0, min(3.0, (recent - older) / older))


def keyword_stats(papers):
    """
    heat(k) = freq(k) * (1 + 0.5 * growth(k))
    freq：标题/作者关键词计 1；摘要命中计 0.4，避免方法词刷屏。
    """
    freq = defaultdict(float)
    by_year = defaultdict(lambda: defaultdict(float))
    venues = defaultdict(lambda: {v: 0.0 for v in VENUES})
    co = defaultdict(float)
    year_venue = defaultdict(lambda: defaultdict(lambda: {v: 0.0 for v in VENUES}))

    for paper in papers:
        terms = paper_terms(paper)
        year = int(paper.get("year") or 0)
        venue = paper.get("venue")
        abstract = (paper.get("abstract") or "").lower()
        if venue not in VENUES or year not in YEARS:
            continue
        weighted = []
        for term in terms:
            score = 1.0
            if term.lower() in abstract:
                score += 0.4
            weighted.append(term)
            freq[term] += score
            by_year[term][year] += 1
            venues[term][venue] += 1
            year_venue[term][year][venue] += 1
        for i, a in enumerate(weighted):
            for b in weighted[i + 1 :]:
                key = "||".join(sorted((a, b)))
                co[key] += 1

    ranked = []
    for key, fval in freq.items():
        series = {y: by_year[key].get(y, 0) for y in YEARS}
        growth = _growth(series)
        heat = fval * (1 + HEAT_ALPHA * growth)
        vmap = venues[key]
        dominant = max(VENUES, key=lambda v: vmap[v])
        ranked.append(
            {
                "k": key,
                "f": round(fval, 3),
                "heat": round(heat, 3),
                "growth": round(growth, 3),
                "dominant": dominant,
                "series": series,
                "venues": vmap,
                "byYearVenue": {str(y): year_venue[key][y] for y in YEARS},
            }
        )
    ranked.sort(key=lambda x: x["heat"], reverse=True)
    edges = [{"a": k.split("||")[0], "b": k.split("||")[1], "w": w} for k, w in co.items()]
    return ranked, edges
