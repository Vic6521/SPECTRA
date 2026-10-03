<script setup>
import { onMounted, onUnmounted, ref, watch } from "vue";

const props = defineProps({
  to: { type: Number, default: 0 },
  duration: { type: Number, default: 1.2 },
  replay: { type: Number, default: 0 },
});
const shown = ref(0);
let raf = 0;

function animate(from, to) {
  cancelAnimationFrame(raf);
  const start = performance.now();
  const span = Math.max(0.4, props.duration) * 1000;
  const tick = (now) => {
    const t = Math.min(1, (now - start) / span);
    const ease = 1 - (1 - t) ** 3;
    shown.value = Math.round(from + (to - from) * ease);
    if (t < 1) raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

onMounted(() => animate(0, Number(props.to) || 0));
watch(() => props.to, (next, prev) => animate(Number(prev) || 0, Number(next) || 0));
watch(() => props.replay, () => animate(0, Number(props.to) || 0));
onUnmounted(() => cancelAnimationFrame(raf));

defineExpose({ replay: () => animate(0, Number(props.to) || 0) });
</script>

<template>
  <span>{{ shown }}</span>
</template>
