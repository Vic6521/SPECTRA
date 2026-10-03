export function magnetMove(event, strength = 0.2) {
  const node = event.currentTarget;
  const box = node.getBoundingClientRect();
  const x = event.clientX - (box.left + box.width / 2);
  const y = event.clientY - (box.top + box.height / 2);
  node.style.transform = `translate3d(${x * strength}px, ${y * strength}px, 0)`;
}

export function magnetLeave(event) {
  event.currentTarget.style.transform = "";
}
