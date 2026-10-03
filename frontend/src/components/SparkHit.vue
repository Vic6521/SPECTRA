<script setup>
import { onUnmounted, ref, useAttrs } from "vue";
import { playSpark, popEl } from "../motion/clickSpark.js";

defineOptions({ inheritAttrs: false });

defineProps({
  as: { type: String, default: "div" },
});
const emit = defineEmits(["hit"]);
const attrs = useAttrs();
const root = ref(null);
const canvas = ref(null);
let stopSpark = () => {};
let stopPop = () => {};

function onClick(event) {
  const el = root.value;
  if (el?.style) el.style.transform = "";
  stopSpark();
  stopPop();
  stopSpark = playSpark(canvas.value, el, event) || (() => {});
  stopPop = popEl(el);
  emit("hit", event);
}

onUnmounted(() => {
  stopSpark();
  stopPop();
});
</script>

<template>
  <component
    :is="as"
    ref="root"
    class="spark-hit"
    v-bind="attrs"
    @click="onClick"
  >
    <canvas ref="canvas" class="spark-layer"></canvas>
    <slot />
  </component>
</template>
