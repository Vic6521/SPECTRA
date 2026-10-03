# SPECTRA · 计算机视觉顶会热词观测台

本机运行后，论文库、收藏和采集都只存在**你自己的浏览器**里，和其他人互不影响。

## 快速开始

本机需要 [Python 3.10+](https://www.python.org/) 和 [Node.js 18+](https://nodejs.org/)。然后在任意目录执行：

```text
git clone https://github.com/Vic6521/SPECTRA.git
cd SPECTRA
python start.py
```

浏览器会打开 [http://localhost:5173/](http://localhost:5173/)。第一次会装依赖，可能要几分钟。停止：在该终端按 `Ctrl+C`。

### 交给 AI 一键部署（复制整段）

```text
把 https://github.com/Vic6521/SPECTRA.git 克隆到我的本机并按仓库 README「快速开始」和 AGENTS.md 启动。需要 Python 3.10+ 和 Node 18+。在仓库根目录执行 python start.py，打开 http://localhost:5173/。只部署到本机，不要上云。论文库保存在我自己的浏览器里。
```

发给朋友时，把上面「快速开始」三行，或「交给 AI」那一段贴出去即可。

## 个性化

- 第一次打开会写入约 47 篇示意论文（真实顶会公开论文，含 CVF / ECVA / arXiv 链接），不是三大会全量。
- 之后你收藏、添加、采集的内容只留在这台电脑的这只浏览器。
- 换电脑或清掉浏览器数据会变成一份新库；需要重新开始时，论文库页可以「重置本机库」。

## 项目介绍

从 CVPR / ICCV / ECCV **2022–2026** 论文里看热点：

1. 单篇 / 批量采集（摘要、关键词、原文链接）
2. 论文库（增删改、查询、收藏）
3. Top 10 热门方向
4. 关键词图谱（点词看相关论文）
5. 多年、三大会热度走势

附加：年度演变、顶会背景。

采集优先 [DBLP](https://dblp.org/faq/How+to+use+the+dblp+search+API.html)，摘要和会议用 arXiv Atom，OpenAlex / Crossref 回退；原文链接优先该篇 CVF / ECVA / arXiv。

热度：`heat = freq × (1 + 0.5 × growth)`，growth 为 2025–2026 相对 2022–2024，截断到 [-1, 3]。

## 手动分步启动

两个终端：

```text
cd backend
python -m pip install -r requirements.txt
python app.py
```

```text
cd frontend
npm install
npm run dev
```

再打开 [http://localhost:5173/](http://localhost:5173/)。

**不要**用 Figma Make 导出代码覆盖 `frontend/` / `backend/`。

## 目录结构

```text
start.py              本机一键启动
AGENTS.md             给 AI Agent 的部署说明
frontend/             Vue 3 + Vite
backend/              Flask
deploy/               云主机脚本（公众使用请走 start.py）
prototype/            本地对照稿
data/                 本地生成，不入库
```

## 代码规范

见 [`codestyle.md`](./codestyle.md)。
