"""SQLite 论文库。本地权威数据在这一张表。"""

import json
import sqlite3
import uuid
from datetime import datetime, timezone

from config import DB_PATH, DATA_DIR, VENUES, YEAR_MAX, YEAR_MIN


def connect():
    DATA_DIR.mkdir(parents=True, exist_ok=True)
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    conn.execute("PRAGMA foreign_keys = ON")
    return conn


def init_db():
    with connect() as conn:
        conn.execute(
            """
            CREATE TABLE IF NOT EXISTS papers (
                id TEXT PRIMARY KEY,
                title TEXT NOT NULL,
                venue TEXT NOT NULL,
                year INTEGER NOT NULL,
                abstract TEXT DEFAULT '',
                keywords TEXT DEFAULT '[]',
                link TEXT DEFAULT '',
                source TEXT DEFAULT 'manual',
                status TEXT DEFAULT 'complete',
                created_at TEXT NOT NULL,
                starred INTEGER NOT NULL DEFAULT 0
            )
            """
        )
        cols = {row[1] for row in conn.execute("PRAGMA table_info(papers)")}
        if "starred" not in cols:
            conn.execute("ALTER TABLE papers ADD COLUMN starred INTEGER NOT NULL DEFAULT 0")


def _row_to_paper(row):
    item = dict(row)
    item["keywords"] = json.loads(item["keywords"] or "[]")
    item["starred"] = bool(item.get("starred"))
    return item


def list_papers(query="", venues=None, year=None, view="all"):
    venues = [v for v in (venues or VENUES) if v in VENUES]
    if not venues:
        venues = list(VENUES)
    sql = (
        "SELECT * FROM papers WHERE venue IN ({}) AND year BETWEEN ? AND ?".format(
            ",".join("?" * len(venues))
        )
    )
    params = [*venues, YEAR_MIN, YEAR_MAX]
    if year:
        sql += " AND year = ?"
        params.append(int(year))
    sql += " ORDER BY year DESC, title COLLATE NOCASE"
    with connect() as conn:
        rows = [_row_to_paper(r) for r in conn.execute(sql, params)]
    q = (query or "").strip().lower()
    if q:
        exact = [p for p in rows if p["title"].lower() == q]
        rows = exact or [
            p
            for p in rows
            if q in p["title"].lower()
            or q in p["id"].lower()
            or q in str(p["year"])
            or q in p["venue"].lower()
            or any(q in k.lower() for k in p["keywords"])
        ]
        mode = "exact" if exact else "fuzzy"
    else:
        mode = "all"
    if view == "starred":
        rows = [p for p in rows if p.get("starred")]
        mode = "starred"
    elif view == "recent":
        rows = sorted(rows, key=lambda p: p.get("created_at") or "", reverse=True)[:24]
        mode = "recent"
    return rows, mode


def get_paper(paper_id):
    with connect() as conn:
        row = conn.execute("SELECT * FROM papers WHERE id = ?", (paper_id,)).fetchone()
    return _row_to_paper(row) if row else None


def find_by_title(title):
    key = " ".join((title or "").split()).lower()
    with connect() as conn:
        rows = conn.execute("SELECT * FROM papers").fetchall()
    for row in rows:
        paper = _row_to_paper(row)
        if " ".join(paper["title"].split()).lower() == key:
            return paper
    return None


def upsert_paper(data, paper_id=None):
    paper_id = paper_id or data.get("id") or uuid.uuid4().hex[:12]
    payload = (
        paper_id,
        data["title"].strip(),
        data["venue"],
        int(data["year"]),
        data.get("abstract") or "",
        json.dumps(data.get("keywords") or [], ensure_ascii=False),
        data.get("link") or "",
        data.get("source") or "manual",
        data.get("status") or "complete",
        data.get("created_at") or datetime.now(timezone.utc).isoformat(timespec="seconds"),
    )
    with connect() as conn:
        exists = conn.execute("SELECT id FROM papers WHERE id = ?", (paper_id,)).fetchone()
        if exists:
            conn.execute(
                """
                UPDATE papers SET title=?, venue=?, year=?, abstract=?, keywords=?,
                    link=?, source=?, status=? WHERE id=?
                """,
                payload[1:9] + (paper_id,),
            )
            if "starred" in data:
                conn.execute(
                    "UPDATE papers SET starred=? WHERE id=?",
                    (1 if data.get("starred") else 0, paper_id),
                )
        else:
            conn.execute(
                """
                INSERT INTO papers (
                    id, title, venue, year, abstract, keywords, link, source, status, created_at, starred
                ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                """,
                payload + (1 if data.get("starred") else 0,),
            )
    return get_paper(paper_id)


def toggle_star(paper_id):
    paper = get_paper(paper_id)
    if not paper:
        return None
    nxt = 0 if paper.get("starred") else 1
    with connect() as conn:
        conn.execute("UPDATE papers SET starred=? WHERE id=?", (nxt, paper_id))
    return get_paper(paper_id)


def delete_paper(paper_id):
    with connect() as conn:
        cur = conn.execute("DELETE FROM papers WHERE id = ?", (paper_id,))
        return cur.rowcount > 0


def count_papers():
    with connect() as conn:
        return conn.execute("SELECT COUNT(*) FROM papers").fetchone()[0]
