const VENUES = ["CVPR", "ICCV", "ECCV"];
const YEARS = [2022, 2023, 2024, 2025, 2026];

const seedPapers = [
  { id: "p1", title: "High-Resolution Image Synthesis with Latent Diffusion Models", venue: "CVPR", year: 2022, keywords: ["Diffusion Models", "Generative Models"], abstract: "提出潜空间扩散模型，成为后续文生图与视觉生成工作的基础之一。", link: "https://openaccess.thecvf.com/" },
  { id: "p2", title: "Masked Autoencoders Are Scalable Vision Learners", venue: "CVPR", year: 2022, keywords: ["Self-Supervised Learning", "Vision Transformer"], abstract: "MAE 通过高比例掩码重建，验证了 ViT 自监督预训练的可扩展性。", link: "https://openaccess.thecvf.com/" },
  { id: "p3", title: "Simple Baselines for Image Restoration", venue: "ECCV", year: 2022, keywords: ["Image Restoration", "Convolution"], abstract: "用简洁基线讨论图像恢复任务中的网络设计与训练策略。", link: "https://www.ecva.net/" },
  { id: "p4", title: "Instant Neural Graphics Primitives", venue: "SIGGRAPH", year: 2022, keywords: ["Neural Radiance Fields", "3D Reconstruction"], abstract: "（样例）快速 NeRF 训练，用于对照三维表示热度。", link: "https://nvlabs.github.io/instant-ngp/" },
  { id: "p5", title: "Segment Anything", venue: "ICCV", year: 2023, keywords: ["Segment Anything", "Foundation Model"], abstract: "提出可提示分割基础模型 SAM，推动分割进入提示式范式。", link: "https://openaccess.thecvf.com/" },
  { id: "p6", title: "DINOv2: Learning Robust Visual Features without Supervision", venue: "ICCV", year: 2023, keywords: ["Self-Supervised Learning", "Foundation Model"], abstract: "大规模自监督视觉特征，强调开箱即用的表征质量。", link: "https://openaccess.thecvf.com/" },
  { id: "p7", title: "3D Gaussian Splatting for Real-Time Radiance Field Rendering", venue: "CVPR", year: 2024, keywords: ["3D Gaussian Splatting", "Neural Radiance Fields"], abstract: "用三维高斯泼溅实现高质量实时新视角合成，迅速成为三维重建热点。", link: "https://openaccess.thecvf.com/" },
  { id: "p8", title: "Scalable Diffusion Models with Transformers", venue: "ICCV", year: 2023, keywords: ["Diffusion Models", "Vision Transformer"], abstract: "DiT 将 Transformer 引入扩散骨干，影响后续视频与多模态生成。", link: "https://openaccess.thecvf.com/" },
  { id: "p9", title: "Vision Transformers Need Registers", venue: "ICLR", year: 2024, keywords: ["Vision Transformer"], abstract: "（对照样例）讨论 ViT 特征图伪影与 register token。", link: "https://arxiv.org/" },
  { id: "p10", title: "Video Generation with Diffusion Transformers", venue: "ECCV", year: 2024, keywords: ["Video Generation", "Diffusion Models"], abstract: "示意：扩散变换器被用于长时视频生成与时序一致性。", link: "https://www.ecva.net/" },
  { id: "p11", title: "Occupancy Networks for Autonomous Driving", venue: "CVPR", year: 2024, keywords: ["Occupancy", "Autonomous Driving"], abstract: "示意：occupancy 表示在端到端自动驾驶感知中升温。", link: "https://openaccess.thecvf.com/" },
  { id: "p12", title: "Multimodal Large Language Models for Visual Reasoning", venue: "ECCV", year: 2024, keywords: ["Multimodal LLM", "Visual Reasoning"], abstract: "示意：视觉语言模型从描述走向推理与工具使用。", link: "https://www.ecva.net/" },
  { id: "p13", title: "Open-Vocabulary Detection with Alignment", venue: "CVPR", year: 2025, keywords: ["Open-Vocabulary", "Object Detection"], abstract: "示意：开放词汇检测继续把 CLIP 类对齐用于任意类别。", link: "https://openaccess.thecvf.com/" },
  { id: "p14", title: "Feed-Forward 3D Gaussian Reconstruction", venue: "ICCV", year: 2025, keywords: ["3D Gaussian Splatting", "3D Reconstruction"], abstract: "示意：前馈式高斯重建降低优化式方法的时延。", link: "https://openaccess.thecvf.com/" },
  { id: "p15", title: "World Models from Video for Embodied Agents", venue: "CVPR", year: 2025, keywords: ["World Model", "Video Generation"], abstract: "示意：用视频生成模型充当世界模型，连接视觉与智能体。", link: "https://openaccess.thecvf.com/" },
  { id: "p16", title: "Efficient SAM-style Segmentation for Robotics", venue: "ECCV", year: 2024, keywords: ["Segment Anything", "Robotics"], abstract: "示意：将可提示分割蒸馏到边缘设备。", link: "https://www.ecva.net/" },
  { id: "p17", title: "Token Compression for Multimodal LLMs", venue: "ICCV", year: 2025, keywords: ["Multimodal LLM", "Efficiency"], abstract: "示意：视觉 token 压缩成为多模态部署主线之一。", link: "https://openaccess.thecvf.com/" },
  { id: "p18", title: "Monocular Depth Anything in the Wild", venue: "CVPR", year: 2024, keywords: ["Depth Estimation", "Foundation Model"], abstract: "示意：大规模深度基础模型覆盖野外场景。", link: "https://openaccess.thecvf.com/" },
  { id: "p19", title: "Unified Video-Language World Models", venue: "CVPR", year: 2026, keywords: ["World Model", "Video Generation", "Multimodal LLM"], abstract: "示意：2026 年世界模型与视频-语言统一架构继续升温。", link: "https://openaccess.thecvf.com/" },
  { id: "p20", title: "Feed-Forward 4D Gaussian Avatars", venue: "ECCV", year: 2026, keywords: ["3D Gaussian Splatting", "3D Reconstruction"], abstract: "示意：高斯泼溅从静态三维走向四维人体/场景。", link: "https://www.ecva.net/" },
  { id: "p21", title: "Embodied VLM Agents in the Wild", venue: "CVPR", year: 2026, keywords: ["Multimodal LLM", "Robotics"], abstract: "示意：视觉语言模型进入具身智能与野外操作。", link: "https://openaccess.thecvf.com/" },
  { id: "p22", title: "Open-Vocabulary 3D Occupancy for Driving", venue: "ICCV", year: 2025, keywords: ["Occupancy", "Open-Vocabulary", "Autonomous Driving"], abstract: "示意：开放词汇与 occupancy 在自动驾驶感知上汇合。", link: "https://openaccess.thecvf.com/" },
  { id: "p23", title: "Long-Horizon Video Diffusion for Simulation", venue: "ECCV", year: 2026, keywords: ["Video Generation", "World Model", "Diffusion Models"], abstract: "示意：长时程视频扩散被当作仿真器，拉动视频生成与世界模型同时上升。", link: "https://www.ecva.net/" },
  { id: "p24", title: "Promptable Perception Foundation Models", venue: "CVPR", year: 2026, keywords: ["Foundation Model", "Segment Anything", "Open-Vocabulary"], abstract: "示意：可提示感知基础模型把分割、检测与开放词汇接到同一接口。", link: "https://openaccess.thecvf.com/" },
  { id: "p25", title: "Occupancy World Models for Driving", venue: "ECCV", year: 2026, keywords: ["Occupancy", "World Model", "Autonomous Driving"], abstract: "示意：occupancy 从静态栅格走向可预测的驾驶世界模型。", link: "https://www.ecva.net/" }
].map((p) => ({ ...p, venue: VENUES.includes(p.venue) ? p.venue : "CVPR" }));

const state = {
  papers: [...seedPapers],
  venues: new Set(VENUES),
  route: "overview",
  selectedKeyword: null,
  editing: null,
  raceYearIndex: 0,
  raceTimer: null,
  yearFrac: 0,
  evoYear: 2026,
  raceRaf: null,
  lastTs: 0,
  pendingQuery: "",
  raceVel: 0,
  raceMode: null
};

const $ = (id) => document.getElementById(id);

function toast(msg) {
  const el = $("toast");
  el.textContent = msg;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 2200);
}

function filteredPapers() {
  return state.papers.filter((p) => state.venues.has(p.venue) && p.year >= 2022 && p.year <= 2026);
}

function keywordStats(list) {
  const freq = new Map();
  const byYear = new Map();
  const venues = new Map();
  const co = new Map();
  for (const p of list) {
    for (const k of p.keywords) {
      freq.set(k, (freq.get(k) || 0) + 1);
      if (!byYear.has(k)) byYear.set(k, {});
      byYear.get(k)[p.year] = (byYear.get(k)[p.year] || 0) + 1;
      if (!venues.has(k)) venues.set(k, { CVPR: 0, ICCV: 0, ECCV: 0 });
      venues.get(k)[p.venue] += 1;
    }
    for (let i = 0; i < p.keywords.length; i++) {
      for (let j = i + 1; j < p.keywords.length; j++) {
        const a = p.keywords[i];
        const b = p.keywords[j];
        const key = a < b ? `${a}||${b}` : `${b}||${a}`;
        co.set(key, (co.get(key) || 0) + 1);
      }
    }
  }
  const ranked = [...freq.entries()]
    .map(([k, f]) => {
      const y = byYear.get(k);
      const recent = (y[2025] || 0) + (y[2026] || 0);
      const older = (y[2022] || 0) + (y[2023] || 0) + (y[2024] || 0);
      const growth = older === 0 ? (recent > 0 ? 1 : 0) : (recent - older) / older;
      const heat = f * (1 + 0.5 * Math.max(-1, Math.min(3, growth)));
      const v = venues.get(k);
      const dominant = Object.entries(v).sort((a, b) => b[1] - a[1])[0][0];
      return { k, f, heat, growth, dominant, series: y, venues: v };
    })
    .sort((a, b) => b.heat - a.heat);
  return { ranked, co };
}

function setRoute(route) {
  state.route = route;
  document.querySelectorAll("nav button").forEach((b) => b.classList.toggle("active", b.dataset.route === route));
  document.querySelectorAll(".view").forEach((v) => v.classList.toggle("show", v.id === `view-${route}`));
  if (route === "overview") renderOverview();
  if (route === "trend") renderTrend(false);
  if (route === "evo") renderEvo();
  if (route === "papers") renderPapers();
  if (route === "crawl") renderCrawl();
}

function renderOverview() {
  const list = filteredPapers();
  const { ranked, co } = keywordStats(list);
  $("kpi-papers").textContent = list.length;
  $("kpi-keys").textContent = ranked.length;
  $("kpi-years").textContent = "2022–2026";
  const share = VENUES.map((v) => `${v} ${list.filter((p) => p.venue === v).length}`).join(" / ");
  $("kpi-share").textContent = share || "—";

  const top = ranked.slice(0, 10);
  const max = top[0]?.heat || 1;
  $("rank").innerHTML = top
    .map((item, i) => {
      const cls = item.growth >= 0 ? "up" : "down";
      const arrow = item.growth >= 0 ? "↑" : "↓";
      return `<div class="rank-item" data-key="${item.k}">
        <header><span>${String(i + 1).padStart(2, "0")}  ${item.k}</span>
        <span class="delta ${cls}">${arrow} ${item.heat.toFixed(1)}</span></header>
        <div class="bar"><i style="width:${(100 * item.heat) / max}%"></i></div>
      </div>`;
    })
    .join("");
  $("rank").querySelectorAll(".rank-item").forEach((el) => {
    el.onclick = () => openKeyword(el.dataset.key);
  });
  drawGraph(ranked.slice(0, 18), co);
}

function drawGraph(nodes, co) {
  const canvas = $("graph");
  const wrap = canvas.parentElement;
  const ctx = canvas.getContext("2d");
  const dpr = window.devicePixelRatio || 1;
  const rect = wrap.getBoundingClientRect();
  const width = Math.max(wrap.clientWidth || rect.width, 320);
  const height = Math.max(wrap.clientHeight || rect.height, 420);
  canvas.width = width * dpr;
  canvas.height = height * dpr;
  canvas.style.width = `${width}px`;
  canvas.style.height = `${height}px`;
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

  const pts = nodes.map((n, i) => {
    const ang = (i / nodes.length) * Math.PI * 2;
    return {
      ...n,
      x: width / 2 + Math.cos(ang) * Math.min(160, width * 0.28),
      y: height / 2 + Math.sin(ang) * Math.min(120, height * 0.28),
      vx: 0,
      vy: 0,
      r: 8 + Math.min(16, n.heat * 2)
    };
  });
  const edges = [];
  for (const [key, w] of co) {
    const [a, b] = key.split("||");
    const pa = pts.find((p) => p.k === a);
    const pb = pts.find((p) => p.k === b);
    if (pa && pb) edges.push({ pa, pb, w });
  }

  let t = 0;
  function color(dom) {
    return { CVPR: "#22d3ee", ICCV: "#a78bfa", ECCV: "#fbbf24" }[dom];
  }
  function tick() {
    t += 1;
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x;
        let dy = pts[j].y - pts[i].y;
        let dist = Math.hypot(dx, dy) || 1;
        const force = (120 - dist) / 400;
        dx /= dist; dy /= dist;
        pts[i].vx -= force * dx; pts[i].vy -= force * dy;
        pts[j].vx += force * dx; pts[j].vy += force * dy;
      }
      pts[i].vx += (width / 2 - pts[i].x) * 0.002;
      pts[i].vy += (height / 2 - pts[i].y) * 0.002;
      pts[i].vx *= 0.85; pts[i].vy *= 0.85;
      pts[i].x += pts[i].vx; pts[i].y += pts[i].vy;
    }
    ctx.clearRect(0, 0, width, height);
    ctx.lineWidth = 1;
    for (const e of edges) {
      ctx.strokeStyle = `rgba(148,163,184,${0.12 + e.w * 0.12})`;
      ctx.beginPath();
      ctx.moveTo(e.pa.x, e.pa.y);
      ctx.lineTo(e.pb.x, e.pb.y);
      ctx.stroke();
    }
    for (const p of pts) {
      const glow = 0.55 + Math.sin(t / 25 + p.x) * 0.15;
      ctx.beginPath();
      ctx.fillStyle = color(p.dominant);
      ctx.globalAlpha = glow;
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
      ctx.strokeStyle = "rgba(232,238,252,0.7)";
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.fillStyle = "#e8eefc";
      ctx.font = "12px IBM Plex Sans";
      ctx.fillText(p.k, p.x + p.r + 4, p.y + 4);
    }
    canvas._pts = pts;
    canvas._raf = requestAnimationFrame(tick);
  }
  if (canvas._raf) cancelAnimationFrame(canvas._raf);
  tick();
  canvas.onclick = (ev) => {
    const r = canvas.getBoundingClientRect();
    const x = ev.clientX - r.left;
    const y = ev.clientY - r.top;
    const hit = (canvas._pts || []).find((p) => Math.hypot(p.x - x, p.y - y) < p.r + 10);
    if (hit) openKeyword(hit.k);
  };
}

function openKeyword(k) {
  state.selectedKeyword = k;
  const related = filteredPapers().filter((p) => p.keywords.includes(k));
  $("drawer-title").textContent = k;
  $("drawer-body").innerHTML = related.length
    ? related.map((p) => paperCard(p)).join("")
    : "<p class='muted'>该词下暂无论文。</p>";
  $("drawer").classList.add("open");
}

function paperCard(p) {
  return `<article style="margin-bottom:14px">
    <div><span class="badge ${p.venue}">${p.venue}</span><small class="muted">${p.year}</small></div>
    <h4 style="margin:6px 0">${p.title}</h4>
    <p style="color:var(--muted);font-size:13px">${p.abstract}</p>
    <div>${p.keywords.map((k) => `<span class="badge ${p.venue}">${k}</span>`).join("")}</div>
    <p><a class="linkish" href="${p.link}" target="_blank" rel="noopener">原文链接</a>
    · <span class="linkish" onclick="editPaper('${p.id}')">编辑</span></p>
  </article>`;
}

function renderPapers(query) {
  const q = (query ?? $("paper-search").value).trim().toLowerCase();
  let list = filteredPapers();
  if (q) {
    list = list.filter((p) =>
      p.title.toLowerCase() === q ||
      p.title.toLowerCase().includes(q) ||
      p.id.toLowerCase().includes(q) ||
      p.keywords.some((k) => k.toLowerCase().includes(q)) ||
      String(p.year) === q
    );
  }
  $("empty-banner").classList.toggle("show", Boolean(q) && list.length === 0);
  $("empty-query").textContent = q;
  $("paper-table").innerHTML = list.map((p) => `
    <tr>
      <td>${p.title}</td>
      <td><span class="badge ${p.venue}">${p.venue}</span></td>
      <td>${p.year}</td>
      <td>${p.keywords.join(" / ")}</td>
      <td>
        <button class="btn" onclick="openPaper('${p.id}')">详情</button>
        <button class="btn" onclick="editPaper('${p.id}')">改</button>
        <button class="btn danger" onclick="askDelete('${p.id}')">删</button>
      </td>
    </tr>`).join("") || `<tr><td colspan="5">没有匹配的论文。</td></tr>`;
}

function openPaper(id) {
  const p = state.papers.find((x) => x.id === id);
  if (!p) return;
  $("drawer-title").textContent = "论文详情";
  $("drawer-body").innerHTML = paperCard(p);
  $("drawer").classList.add("open");
}

function editPaper(id) {
  const p = id ? state.papers.find((x) => x.id === id) : { id: "", title: "", venue: "CVPR", year: 2026, keywords: [], abstract: "", link: "" };
  state.editing = p.id || null;
  $("f-title").value = p.title;
  $("f-venue").value = p.venue;
  $("f-year").value = p.year;
  $("f-keys").value = (p.keywords || []).join(", ");
  $("f-abs").value = p.abstract || "";
  $("f-link").value = p.link || "";
  $("modal-title").textContent = p.id ? "编辑论文" : "新增论文";
  $("modal-edit").classList.add("open");
}

function savePaper() {
  const data = {
    id: state.editing || `p${Date.now()}`,
    title: $("f-title").value.trim(),
    venue: $("f-venue").value,
    year: Number($("f-year").value),
    keywords: $("f-keys").value.split(/[,，]/).map((s) => s.trim()).filter(Boolean),
    abstract: $("f-abs").value.trim(),
    link: $("f-link").value.trim() || "https://dblp.org/"
  };
  if (!data.title) return toast("标题不能为空");
  const idx = state.papers.findIndex((p) => p.id === data.id);
  if (idx >= 0) state.papers[idx] = data;
  else state.papers.unshift(data);
  $("modal-edit").classList.remove("open");
  toast("已写入论文库");
  renderPapers();
}

function askDelete(id) {
  state.deleting = id;
  $("modal-del").classList.add("open");
}

function confirmDelete() {
  state.papers = state.papers.filter((p) => p.id !== state.deleting);
  $("modal-del").classList.remove("open");
  $("drawer").classList.remove("open");
  toast("已删除");
  renderPapers();
}

function venueYearCounts(keyword, year) {
  const out = { CVPR: 0, ICCV: 0, ECCV: 0 };
  filteredPapers()
    .filter((p) => p.year === year && p.keywords.includes(keyword))
    .forEach((p) => { out[p.venue] += 1; });
  return out;
}

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function easeInOutCubic(t) {
  return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2;
}

function morphFrac(frac) {
  const i0 = Math.max(0, Math.min(YEARS.length - 1, Math.floor(frac)));
  const t = Math.min(1, Math.max(0, frac - i0));
  return i0 + easeInOutCubic(t);
}

function countsAtFrac(keyword, frac) {
  const i0 = Math.max(0, Math.min(YEARS.length - 1, Math.floor(frac)));
  const i1 = Math.min(i0 + 1, YEARS.length - 1);
  const t = Math.min(1, Math.max(0, frac - i0));
  const a = venueYearCounts(keyword, YEARS[i0]);
  const b = venueYearCounts(keyword, YEARS[i1]);
  return {
    CVPR: lerp(a.CVPR, b.CVPR, t),
    ICCV: lerp(a.ICCV, b.ICCV, t),
    ECCV: lerp(a.ECCV, b.ECCV, t)
  };
}

function ensureYearDots() {
  const host = $("year-dots");
  if (host.dataset.ready) return;
  host.dataset.ready = "1";
  host.innerHTML = YEARS.map((y, i) => `<button type="button" data-i="${i}">${y}</button>`).join("");
  host.querySelectorAll("button").forEach((b) => {
    b.onclick = () => springRaceTo(Number(b.dataset.i));
  });
}

function ensureRaceRows(keys) {
  const host = $("race-bars");
  keys.forEach((k, i) => {
    if ([...host.children].some((el) => el.dataset.key === k)) return;
    const row = document.createElement("div");
    row.className = "race-row enter";
    row.dataset.key = k;
    row.style.setProperty("--i", String(i));
    row.innerHTML = `<div class="race-row-meta"><span class="race-name"></span><span class="race-n"></span></div>
      <div class="race-track"><i class="seg CVPR"></i><i class="seg ICCV"></i><i class="seg ECCV"></i></div>`;
    row.onclick = () => openKeyword(k);
    row.addEventListener("animationend", () => row.classList.remove("enter"), { once: true });
    host.appendChild(row);
  });
}

function paintRaceAt(rawFrac) {
  const frac = Math.max(0, Math.min(YEARS.length - 1, rawFrac));
  const { ranked } = keywordStats(filteredPapers());
  const pool = ranked.slice(0, 16);
  ensureYearDots();
  ensureRaceRows(pool.map((x) => x.k));
  const values = pool.map((item) => {
    const c = countsAtFrac(item.k, frac);
    return { k: item.k, ...c, n: c.CVPR + c.ICCV + c.ECCV };
  }).sort((a, b) => b.n - a.n);
  const visible = values.filter((v) => v.n > 0.04).slice(0, 8);
  const shown = new Set(visible.map((v) => v.k));
  const max = Math.max(1.2, ...visible.map((v) => v.n), 1);
  [...$("race-bars").children].forEach((row) => {
    const on = shown.has(row.dataset.key);
    row.style.opacity = on ? "1" : "0";
    row.style.pointerEvents = on ? "auto" : "none";
  });
  visible.forEach((v, i) => {
    const row = [...$("race-bars").children].find((el) => el.dataset.key === v.k);
    if (!row) return;
    row.style.transform = `translateY(${i * 52}px)`;
    row.querySelector(".race-name").textContent = v.k;
    row.querySelector(".race-n").textContent = `${v.n.toFixed(1)} 篇`;
    row.querySelector(".seg.CVPR").style.width = `${(100 * v.CVPR) / max}%`;
    row.querySelector(".seg.ICCV").style.width = `${(100 * v.ICCV) / max}%`;
    row.querySelector(".seg.ECCV").style.width = `${(100 * v.ECCV) / max}%`;
  });
  $("year-reel-inner").style.transform = `translateY(${-frac * 72}px)`;
  $("year-scrub").value = String(frac);
  $("year-dots").querySelectorAll("button").forEach((b) => {
    b.classList.toggle("on", Math.round(frac) === Number(b.dataset.i));
  });
}

function renderTrend(reset) {
  if (reset) state.yearFrac = 0;
  paintRaceAt(state.yearFrac);
}

function stopRace() {
  if (state.raceRaf) cancelAnimationFrame(state.raceRaf);
  if (state.raceTimer) clearInterval(state.raceTimer);
  state.raceRaf = null;
  state.raceTimer = null;
  state.raceMode = null;
  $("btn-play").textContent = "播放";
}

function playRace() {
  if (state.raceMode === "play") {
    state.yearFrac = morphFrac(state.yearFrac);
    paintRaceAt(state.yearFrac);
    stopRace();
    return;
  }
  stopRace();
  $("btn-play").textContent = "暂停";
  state.raceMode = "play";
  if (state.yearFrac >= YEARS.length - 1 - 0.01) state.yearFrac = 0;
  state.lastTs = 0;
  const tick = (ts) => {
    if (state.raceMode !== "play") return;
    if (!state.lastTs) state.lastTs = ts;
    const dt = ts - state.lastTs;
    state.lastTs = ts;
    state.yearFrac += dt / 1800;
    if (state.yearFrac >= YEARS.length - 1) {
      state.yearFrac = YEARS.length - 1;
      paintRaceAt(state.yearFrac);
      stopRace();
      return;
    }
    paintRaceAt(morphFrac(state.yearFrac));
    state.raceRaf = requestAnimationFrame(tick);
  };
  state.raceRaf = requestAnimationFrame(tick);
}

function springRaceTo(target) {
  stopRace();
  state.raceMode = "spring";
  state.raceVel = 0;
  state.lastTs = 0;
  const duration = 2;
  const damping = 20 + 40 * (1 / duration);
  const stiffness = 100 * (1 / duration);
  const tick = (ts) => {
    if (state.raceMode !== "spring") return;
    if (!state.lastTs) state.lastTs = ts;
    const dt = Math.min(0.032, (ts - state.lastTs) / 1000);
    state.lastTs = ts;
    const acc = (target - state.yearFrac) * stiffness - state.raceVel * damping;
    state.raceVel += acc * dt;
    state.yearFrac += state.raceVel * dt;
    if (Math.abs(target - state.yearFrac) < 0.003 && Math.abs(state.raceVel) < 0.01) {
      state.yearFrac = target;
      paintRaceAt(state.yearFrac);
      stopRace();
      return;
    }
    paintRaceAt(state.yearFrac);
    state.raceRaf = requestAnimationFrame(tick);
  };
  state.raceRaf = requestAnimationFrame(tick);
}

function evoTag(item, i, prev) {
  const was = prev.indexOf(item.k);
  if (was < 0) return { tag: "New", kind: "CVPR" };
  if (was > i) return { tag: "↑", kind: "CVPR" };
  if (was < i) return { tag: "↓", kind: "ECCV" };
  return { tag: "→", kind: "ICCV" };
}

function renderEvo() {
  const pills = $("evo-pills");
  if (!pills.dataset.ready) {
    pills.dataset.ready = "1";
    pills.innerHTML = YEARS.map((y) => `<button type="button" data-y="${y}">${y}</button>`).join("");
    pills.querySelectorAll("button").forEach((b) => {
      b.onclick = () => {
        state.evoYear = Number(b.dataset.y);
        renderEvo();
      };
    });
  }
  pills.querySelectorAll("button").forEach((b) => {
    b.classList.toggle("on", Number(b.dataset.y) === state.evoYear);
  });

  const year = state.evoYear;
  const list = filteredPapers().filter((p) => p.year === year);
  const { ranked } = keywordStats(list);
  const prev = keywordStats(filteredPapers().filter((p) => p.year === year - 1)).ranked.map((x) => x.k);
  const items = ranked.slice(0, 10);
  const host = $("evo-list");
  const first = new Map();
  [...host.children].forEach((el) => first.set(el.dataset.key, el.getBoundingClientRect()));

  const keep = new Set(items.map((x) => x.k));
  [...host.children].forEach((el) => {
    if (!keep.has(el.dataset.key)) el.remove();
  });

  items.forEach((item, i) => {
    let el = [...host.children].find((node) => node.dataset.key === item.k);
    const born = !el;
    if (!el) {
      el = document.createElement("div");
      el.className = "evo-card born";
      el.dataset.key = item.k;
      el.onclick = () => openKeyword(item.k);
      host.appendChild(el);
    }
    const { tag, kind } = evoTag(item, i, prev);
    el.style.setProperty("--i", String(i));
    el.innerHTML = `<div><span class="rk">${String(i + 1).padStart(2, "0")}</span>${item.k}</div>
      <span class="badge ${kind}">${tag}</span>`;
    host.appendChild(el);
    if (born) {
      el.addEventListener("animationend", () => el.classList.remove("born"), { once: true });
    }
  });

  items.forEach((item) => {
    const el = [...host.children].find((node) => node.dataset.key === item.k);
    const prevBox = first.get(item.k);
    if (!el || !prevBox) return;
    const last = el.getBoundingClientRect();
    const dy = prevBox.top - last.top;
    if (Math.abs(dy) < 1) return;
    el.animate(
      [{ transform: `translateY(${dy}px)` }, { transform: "none" }],
      { duration: 520, easing: "cubic-bezier(0.22, 1.2, 0.36, 1)" }
    );
  });
}

function renderCrawl() {
  if (state.pendingQuery) $("crawl-title").value = state.pendingQuery;
}

function fakeCrawl(title) {
  return {
    id: `p${Date.now()}`,
    title,
    venue: "CVPR",
    year: 2026,
    keywords: ["Open-Vocabulary", "Foundation Model"],
    abstract: `（原型模拟）已按标题「${title}」向公开源查询，返回摘要、关键词与原文链接。阶段二将接入 DBLP / 会议官网。`,
    link: `https://dblp.org/search?q=${encodeURIComponent(title)}`
  };
}

function crawlOne() {
  const title = $("crawl-title").value.trim();
  if (!title) return toast("请输入论文标题");
  const paper = fakeCrawl(title);
  $("crawl-preview").innerHTML = paperCard(paper);
  $("crawl-preview").dataset.json = JSON.stringify(paper);
  toast("采集完成（原型模拟）");
}

function commitCrawl() {
  const raw = $("crawl-preview").dataset.json;
  if (!raw) return toast("请先采集");
  const paper = JSON.parse(raw);
  state.papers.unshift(paper);
  state.pendingQuery = "";
  toast("已写入论文库");
  setRoute("papers");
}

function batchCrawl() {
  const lines = $("batch-text").value.split(/\n/).map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return toast("请粘贴标题列表");
  let i = 0;
  $("batch-bar").style.width = "0%";
  const timer = setInterval(() => {
    i += 1;
    const paper = fakeCrawl(lines[i - 1]);
    state.papers.unshift(paper);
    $("batch-bar").style.width = `${(100 * i) / lines.length}%`;
    if (i >= lines.length) {
      clearInterval(timer);
      toast(`批量写入 ${lines.length} 篇`);
    }
  }, 280);
}

function goCrawlFromEmpty() {
  state.pendingQuery = $("paper-search").value.trim();
  setRoute("crawl");
  $("tab-single").click();
}

window.openPaper = openPaper;
window.editPaper = editPaper;
window.askDelete = askDelete;

function init() {
  document.querySelectorAll("nav button").forEach((b) => {
    b.onclick = () => setRoute(b.dataset.route);
  });
  document.querySelectorAll(".chip").forEach((c) => {
    c.onclick = () => {
      const v = c.dataset.venue;
      if (state.venues.has(v)) {
        if (state.venues.size === 1) return;
        state.venues.delete(v);
      } else state.venues.add(v);
      c.classList.toggle("on", state.venues.has(v));
      setRoute(state.route);
    };
  });
  $("global-search").addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      $("paper-search").value = $("global-search").value;
      setRoute("papers");
      renderPapers();
    }
  });
  $("paper-search").addEventListener("input", () => renderPapers());
  $("btn-add").onclick = () => editPaper(null);
  $("btn-save").onclick = savePaper;
  $("btn-del").onclick = confirmDelete;
  $("btn-play").onclick = playRace;
  $("year-scrub").addEventListener("input", (e) => {
    stopRace();
    state.yearFrac = Number(e.target.value);
    paintRaceAt(state.yearFrac);
  });
  $("btn-crawl").onclick = crawlOne;
  $("btn-commit").onclick = commitCrawl;
  $("btn-batch").onclick = batchCrawl;
  $("btn-empty-crawl").onclick = goCrawlFromEmpty;
  document.querySelectorAll("[data-close]").forEach((b) => {
    b.onclick = () => {
      $("drawer").classList.remove("open");
      $("modal-edit").classList.remove("open");
      $("modal-del").classList.remove("open");
    };
  });
  $("tab-single").onclick = () => {
    $("pane-single").style.display = "block";
    $("pane-batch").style.display = "none";
  };
  $("tab-batch").onclick = () => {
    $("pane-single").style.display = "none";
    $("pane-batch").style.display = "block";
  };
  window.addEventListener("resize", () => {
    if (state.route === "overview") renderOverview();
  });
  requestAnimationFrame(() => setRoute("overview"));
}

init();
