#!/usr/bin/env bash
# 华为云 ECS：先构建前端，再用 gunicorn 托管 Flask（同端口提供页面 + /api）。
set -euo pipefail
ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT/frontend"
npm ci
npm run build
cd "$ROOT/backend"
python3 -m pip install -r requirements.txt gunicorn
export SPECTRA_HOST=0.0.0.0
export FLASK_DEBUG=0
export PORT="${PORT:-5000}"
exec gunicorn -w 2 -b "0.0.0.0:${PORT}" app:app
