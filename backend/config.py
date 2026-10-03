"""SPECTRA 后端常量。年份与会议范围按作业题面固定。"""

from pathlib import Path

ROOT = Path(__file__).resolve().parent
DATA_DIR = ROOT.parent / "data"
DB_PATH = DATA_DIR / "spectra.db"

VENUES = ("CVPR", "ICCV", "ECCV")
YEARS = (2022, 2023, 2024, 2025, 2026)
YEAR_MIN, YEAR_MAX = YEARS[0], YEARS[-1]
HEAT_ALPHA = 0.5
DBLP_API = "https://dblp.org/search/publ/api"
DBLP_MIRRORS = (
    "https://dblp.org/search/publ/api",
    "https://dblp.uni-trier.de/search/publ/api",
    "https://dblp.dagstuhl.de/search/publ/api",
)
OPENALEX_API = "https://api.openalex.org/works"
CROSSREF_API = "https://api.crossref.org/works"
REQUEST_TIMEOUT = 12
DBLP_TIMEOUT = 5
BATCH_SLEEP_SEC = 0.35
MAX_IMPORT_ROWS = 40
