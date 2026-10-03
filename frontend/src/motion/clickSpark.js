export function pointFrom(event, root) {
  const box = root?.getBoundingClientRect();
  if (event?.clientX != null && event.clientY != null) return event;
  return {
    clientX: (box?.left || 0) + (box?.width || 0) / 2,
    clientY: (box?.top || 0) + (box?.height || 0) / 2,
  };
}

export function playSpark(canvas, root, event) {
  if (!canvas || !root) return 0;
  const box = root.getBoundingClientRect();
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = Math.max(1, box.width * dpr);
  canvas.height = Math.max(1, box.height * dpr);
  const ctx = canvas.getContext("2d");
  const pt = pointFrom(event, root);
  const x = (pt.clientX - box.left) * dpr;
  const y = (pt.clientY - box.top) * dpr;
  const count = 8;
  const radius = Math.min(42, Math.max(22, box.width * 0.18)) * dpr;
  const size = 11 * dpr;
  const start = performance.now();
  let frame = 0;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / 400);
    const ease = 1 - (1 - t) ** 3;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = `rgba(0, 105, 224, ${1 - ease})`;
    ctx.lineWidth = 1.6 * dpr;
    ctx.lineCap = "round";
    for (let i = 0; i < count; i += 1) {
      const angle = (Math.PI * 2 * i) / count + 0.4;
      const dist = radius * ease;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(angle) * dist, y + Math.sin(angle) * dist);
      ctx.lineTo(
        x + Math.cos(angle) * (dist + size * (1 - ease)),
        y + Math.sin(angle) * (dist + size * (1 - ease)),
      );
      ctx.stroke();
    }
    if (t < 1) frame = requestAnimationFrame(tick);
    else ctx.clearRect(0, 0, canvas.width, canvas.height);
  };
  frame = requestAnimationFrame(tick);
  return () => cancelAnimationFrame(frame);
}

export function popEl(el, ms = 420) {
  if (!el) return () => {};
  el.classList.remove("pop");
  void el.offsetWidth;
  el.classList.add("pop");
  const timer = window.setTimeout(() => el.classList.remove("pop"), ms);
  return () => clearTimeout(timer);
}
