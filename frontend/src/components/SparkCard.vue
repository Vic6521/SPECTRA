<script setup>
import { onUnmounted, ref } from "vue";
import { playSpark, popEl } from "../motion/clickSpark.js";

defineProps({
  featured: Boolean,
  active: Boolean,
});
const emit = defineEmits(["select"]);

const root = ref(null);
const canvas = ref(null);
let stopSpark = () => {};
let stopPop = () => {};

function onMove(event) {
  const box = root.value?.getBoundingClientRect();
  if (!box) return;
  const x = ((event.clientX - box.left) / box.width) * 100;
  const y = ((event.clientY - box.top) / box.height) * 100;
  root.value.style.setProperty("--mx", `${x}%`);
  root.value.style.setProperty("--my", `${y}%`);
}

function onLeave() {
  root.value?.style.setProperty("--mx", "50%");
  root.value?.style.setProperty("--my", "50%");
}

function onClick(event) {
  stopSpark();
  stopPop();
  stopSpark = playSpark(canvas.value, root.value, event) || (() => {});
  stopPop = popEl(root.value, 520);
  emit("select");
}

onUnmounted(() => {
  stopSpark();
  stopPop();
});
</script>

<template>
  <article
    ref="root"
    class="dash-mini spotlight-card"
    :class="{ featured, active }"
    role="button"
    tabindex="0"
    @mousemove="onMove"
    @mouseleave="onLeave"
    @click="onClick"
    @keydown.enter.prevent="onClick"
    @keydown.space.prevent="onClick"
  >
    <canvas ref="canvas" class="spark-layer"></canvas>
    <div class="spotlight-body">
      <slot />
    </div>
  </article>
</template>
