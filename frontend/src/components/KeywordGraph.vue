<script setup>
import { computed } from "vue";
import SparkHit from "./SparkHit.vue";

const props = defineProps({ nodes: { type: Array, default: () => [] } });
const emit = defineEmits(["select"]);

const shown = computed(() => (props.nodes || []).slice(0, 12));

function slotStyle(i, total) {
  if (i === 0) return { left: "50%", top: "50%" };
  const rest = Math.max(1, total - 1);
  const innerN = Math.min(6, rest);
  const inner = i <= innerN;
  const count = inner ? innerN : rest - innerN;
  const idx = inner ? i - 1 : i - 1 - innerN;
  const offset = inner ? -Math.PI / 2 : -Math.PI / 2 + 0.28;
  const angle = offset + (idx / Math.max(1, count)) * Math.PI * 2;
  const rx = inner ? 28 : 43;
  const ry = inner ? 30 : 42;
  return {
    left: `${50 + rx * Math.cos(angle)}%`,
    top: `${50 + ry * Math.sin(angle)}%`,
  };
}

let magnetLock = 0;

function magnetMove(event) {
  if (Date.now() < magnetLock) return;
  const btn = event.currentTarget;
  const box = btn.getBoundingClientRect();
  const x = event.clientX - (box.left + box.width / 2);
  const y = event.clientY - (box.top + box.height / 2);
  btn.style.transform = `translate(-50%, -50%) translate3d(${x * 0.14}px, ${y * 0.14}px, 0) scale(1.06)`;
}

function magnetLeave(event) {
  event.currentTarget.style.transform = "translate(-50%, -50%)";
}

function hitNode(event, key) {
  magnetLock = Date.now() + 450;
  magnetLeave(event);
  emit("select", key);
}
</script>

<template>
  <div class="graph-stage">
    <div class="orbit inner">
      <i class="orbit-dot"></i>
      <i class="orbit-dot d2"></i>
    </div>
    <div class="orbit mid">
      <i class="orbit-dot"></i>
    </div>
    <div class="orbit outer">
      <i class="orbit-dot"></i>
      <i class="orbit-dot d2"></i>
    </div>
    <span class="speck s1"></span>
    <span class="speck s2"></span>
    <span class="speck s3"></span>
    <span class="speck s4"></span>
    <SparkHit
      v-for="(n, i) in shown"
      :key="n.k"
      as="button"
      type="button"
      class="pill"
      :class="{ core: i === 0, outer: i > 6 }"
      :style="slotStyle(i, shown.length)"
      @mousemove="magnetMove"
      @mouseleave="magnetLeave"
      @hit="hitNode($event, n.k)"
    >{{ n.k }}</SparkHit>
  </div>
</template>
