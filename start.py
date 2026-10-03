"""本机一键启动 SPECTRA：装依赖、开 Flask + Vite，并打开浏览器。"""

import os
import shutil
import subprocess
import sys
import time
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND = ROOT / "backend"
FRONTEND = ROOT / "frontend"
URL = "http://localhost:5173/"


def fail(message):
    print(message, file=sys.stderr)
    sys.exit(1)


def npm_cmd():
    name = "npm.cmd" if os.name == "nt" else "npm"
    found = shutil.which(name) or shutil.which("npm")
    if not found:
        fail("缺少 npm。请先安装 Node.js 18+：https://nodejs.org/")
    return found


def main():
    if sys.version_info < (3, 10):
        fail("需要 Python 3.10 或更高版本。")
    npm = npm_cmd()

    print("安装后端依赖…")
    subprocess.check_call(
        [sys.executable, "-m", "pip", "install", "-r", str(BACKEND / "requirements.txt")]
    )
    print("安装前端依赖…")
    subprocess.check_call([npm, "install"], cwd=FRONTEND)

    env = os.environ.copy()
    env["FLASK_DEBUG"] = "0"
    backend = subprocess.Popen([sys.executable, "app.py"], cwd=BACKEND, env=env)
    frontend = subprocess.Popen([npm, "run", "dev", "--", "--host", "127.0.0.1"], cwd=FRONTEND)

    print("等待服务起来…")
    time.sleep(2.5)
    webbrowser.open(URL)
    print(f"SPECTRA 已在本机启动：{URL}")
    print("论文库只存在这台电脑的浏览器里，和其他人互不影响。按 Ctrl+C 停止。")
    try:
        while backend.poll() is None and frontend.poll() is None:
            time.sleep(0.5)
        if backend.poll() not in (None, 0):
            fail("后端异常退出，请看上方报错。")
        if frontend.poll() not in (None, 0):
            fail("前端异常退出，请看上方报错。")
    except KeyboardInterrupt:
        print("\n正在停止…")
    finally:
        for proc in (frontend, backend):
            if proc.poll() is None:
                proc.terminate()
        for proc in (frontend, backend):
            try:
                proc.wait(timeout=5)
            except Exception:
                proc.kill()


if __name__ == "__main__":
    main()
