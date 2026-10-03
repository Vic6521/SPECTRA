import {
  clearLibrary,
  createPaper as createLocal,
  deletePaper as deleteLocal,
  ensureLibrary,
  findByTitle,
  listPapers,
  resetToSeed,
  toggleStar as starLocal,
  updatePaper as updateLocal,
  upsertPaper,
} from "./localLibrary.js";

const YEARS = [2022, 2023, 2024, 2025, 2026];

async function request(path, options = {}) {
  const resp = await fetch(path, {
    headers: { "Content-Type": "application/json", ...(options.headers || {}) },
    ...options,
  });
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) {
    throw new Error(data.error || `请求失败 ${resp.status}`);
  }
  return data;
}

function markExists(paper) {
  return { ...paper, exists: !!findByTitle(paper.title) };
}

async function normalize(body) {
  return request("/api/normalize", { method: "POST", body: JSON.stringify(body) });
}

export function venueQuery(venues) {
  return venues.join(",");
}

export const api = {
  async papers(params = {}) {
    await ensureLibrary();
    const venues = typeof params.venues === "string"
      ? params.venues.split(",")
      : params.venues;
    return listPapers({
      q: params.q,
      venues,
      year: params.year,
      view: params.view || "all",
    });
  },
  async createPaper(body) {
    await ensureLibrary();
    const payload = await normalize(body);
    return createLocal(payload);
  },
  async updatePaper(id, body) {
    await ensureLibrary();
    const payload = await normalize(body);
    return updateLocal(id, payload);
  },
  async deletePaper(id) {
    await ensureLibrary();
    return deleteLocal(id);
  },
  async crawl(title, write = false) {
    await ensureLibrary();
    if (write) {
      const existing = findByTitle(title);
      const data = await request("/api/crawl", {
        method: "POST",
        body: JSON.stringify({ title, write: false }),
      });
      const saved = upsertPaper(data.paper, existing?.id);
      return { paper: saved, written: true };
    }
    const data = await request("/api/crawl", {
      method: "POST",
      body: JSON.stringify({ title, write: false }),
    });
    return { ...data, paper: markExists(data.paper), exists: !!findByTitle(data.paper?.title) };
  },
  async crawlBatch(text, write = false, papers = null) {
    await ensureLibrary();
    if (write && Array.isArray(papers) && papers.length) {
      const written = papers.map((paper) => {
        const existing = findByTitle(paper.title);
        return upsertPaper({ ...paper, source: paper.source || "crawl" }, existing?.id);
      });
      return { papers: written, errors: [], count: written.length, written: true };
    }
    const data = await request("/api/crawl/batch", {
      method: "POST",
      body: JSON.stringify({ text, write: false }),
    });
    const preview = (data.papers || []).map(markExists);
    return { ...data, papers: preview, written: false };
  },
  async toggleStar(id) {
    await ensureLibrary();
    return starLocal(id);
  },
  async stats(venues) {
    await ensureLibrary();
    const { papers } = listPapers({ venues, view: "all" });
    return request("/api/stats", {
      method: "POST",
      body: JSON.stringify({ papers, venues }),
    });
  },
  resetToSeed,
  clearLibrary,
};

export { YEARS };
