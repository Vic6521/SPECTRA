const STORAGE_KEY = "spectra.library.v1";
const META_KEY = "spectra.library.meta.v1";
const VENUES = ["CVPR", "ICCV", "ECCV"];
const YEAR_MIN = 2022;
const YEAR_MAX = 2026;

let boot = null;

function nowIso() {
  return new Date().toISOString().replace(/\.\d{3}Z$/, "Z");
}

function normalizeTitle(title) {
  return String(title || "").replace(/\s+/g, " ").trim();
}

function titleKey(title) {
  return normalizeTitle(title).toLowerCase();
}

function newId() {
  if (typeof crypto !== "undefined" && crypto.randomUUID) {
    return crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  }
  return Math.random().toString(16).slice(2, 14);
}

function readMeta() {
  try {
    return JSON.parse(localStorage.getItem(META_KEY) || "null") || {};
  } catch {
    return {};
  }
}

function writeMeta(patch) {
  const next = { ...readMeta(), ...patch, updatedAt: nowIso() };
  localStorage.setItem(META_KEY, JSON.stringify(next));
  return next;
}

function readAll() {
  try {
    const rows = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
    return Array.isArray(rows) ? rows : [];
  } catch {
    return [];
  }
}

function writeAll(papers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(papers));
  return papers;
}

function shape(paper, fallbackId) {
  const keywords = Array.isArray(paper.keywords)
    ? paper.keywords.map((k) => String(k).trim()).filter(Boolean)
    : String(paper.keywords || "")
        .replace(/，/g, ",")
        .split(",")
        .map((k) => k.trim())
        .filter(Boolean);
  return {
    id: paper.id || fallbackId || newId(),
    title: normalizeTitle(paper.title),
    venue: String(paper.venue || "CVPR").toUpperCase(),
    year: Number(paper.year) || YEAR_MAX,
    abstract: String(paper.abstract || "").trim(),
    keywords,
    link: String(paper.link || "").trim(),
    source: paper.source || "manual",
    status: paper.status || "complete",
    created_at: paper.created_at || nowIso(),
    starred: !!paper.starred,
  };
}

async function fetchSeed() {
  const resp = await fetch("/api/seed");
  const data = await resp.json().catch(() => ({}));
  if (!resp.ok) throw new Error(data.error || "无法拉取示意库");
  return (data.papers || []).map((p) => shape({ ...p, starred: false }));
}

export async function ensureLibrary() {
  if (boot) return boot;
  boot = (async () => {
    const existing = readAll();
    if (existing.length || readMeta().ready) return existing;
    try {
      const seeded = await fetchSeed();
      writeAll(seeded);
      writeMeta({ ready: true, seeded: true, origin: "seed" });
      return seeded;
    } catch {
      writeAll([]);
      return [];
    }
  })();
  try {
    return await boot;
  } finally {
    boot = null;
  }
}

export function listPapers({ q = "", venues = VENUES, year, view = "all" } = {}) {
  const picked = (Array.isArray(venues) ? venues : String(venues || "").split(","))
    .map((v) => String(v).trim().toUpperCase())
    .filter((v) => VENUES.includes(v));
  const allow = picked.length ? picked : VENUES;
  let rows = readAll().filter(
    (p) => allow.includes(p.venue) && p.year >= YEAR_MIN && p.year <= YEAR_MAX,
  );
  if (year) rows = rows.filter((p) => p.year === Number(year));
  rows = [...rows].sort((a, b) => b.year - a.year || a.title.localeCompare(b.title));
  const query = String(q || "").trim().toLowerCase();
  let mode = "all";
  if (query) {
    const exact = rows.filter((p) => p.title.toLowerCase() === query);
    rows = exact.length
      ? exact
      : rows.filter(
          (p) =>
            p.title.toLowerCase().includes(query) ||
            p.id.toLowerCase().includes(query) ||
            String(p.year).includes(query) ||
            p.venue.toLowerCase().includes(query) ||
            (p.keywords || []).some((k) => k.toLowerCase().includes(query)),
        );
    mode = exact.length ? "exact" : "fuzzy";
  }
  if (view === "starred") {
    rows = rows.filter((p) => p.starred);
    mode = "starred";
  } else if (view === "recent") {
    rows = [...rows].sort((a, b) => (b.created_at || "").localeCompare(a.created_at || "")).slice(0, 24);
    mode = "recent";
  }
  return { papers: rows, total: rows.length, mode, query: q };
}

export function getPaper(id) {
  return readAll().find((p) => p.id === id) || null;
}

export function findByTitle(title) {
  const key = titleKey(title);
  return readAll().find((p) => titleKey(p.title) === key) || null;
}

export function upsertPaper(data, paperId = null) {
  const papers = readAll();
  const id = paperId || data.id || newId();
  const idx = papers.findIndex((p) => p.id === id);
  const prev = idx >= 0 ? papers[idx] : null;
  const next = shape(
    {
      ...prev,
      ...data,
      id,
      created_at: prev?.created_at || data.created_at,
      starred: data.starred ?? prev?.starred ?? false,
    },
    id,
  );
  if (idx >= 0) papers[idx] = next;
  else papers.unshift(next);
  writeAll(papers);
  return next;
}

export function createPaper(data) {
  if (findByTitle(data.title)) {
    const err = new Error("论文库中已有相同标题");
    err.status = 409;
    throw err;
  }
  return upsertPaper({ ...data, source: data.source || "manual", created_at: nowIso() });
}

export function updatePaper(id, data) {
  if (!getPaper(id)) {
    const err = new Error("未找到该论文");
    err.status = 404;
    throw err;
  }
  return upsertPaper(data, id);
}

export function deletePaper(id) {
  const papers = readAll();
  const next = papers.filter((p) => p.id !== id);
  if (next.length === papers.length) {
    const err = new Error("未找到该论文");
    err.status = 404;
    throw err;
  }
  writeAll(next);
  return { ok: true };
}

export function toggleStar(id) {
  const paper = getPaper(id);
  if (!paper) {
    const err = new Error("未找到该论文");
    err.status = 404;
    throw err;
  }
  return upsertPaper({ ...paper, starred: !paper.starred }, id);
}

export async function resetToSeed() {
  const seeded = await fetchSeed();
  writeAll(seeded);
  writeMeta({ ready: true, seeded: true, origin: "seed" });
  return seeded;
}

export function clearLibrary() {
  writeAll([]);
  writeMeta({ ready: true, seeded: false, origin: "empty" });
  return [];
}

export function libraryMeta() {
  return { ...readMeta(), count: readAll().length };
}

export { VENUES, YEAR_MIN, YEAR_MAX };
