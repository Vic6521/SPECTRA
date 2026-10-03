<script setup>
import { inject } from "vue";
import { magnetLeave, magnetMove } from "../motion/magnet.js";

defineProps({
  title: { type: String, default: "" },
});

const venues = inject("venues");
const toggleVenue = inject("toggleVenue");
</script>

<template>
  <div class="page-hero">
    <div>
      <p class="kicker">SPECTRA / CVPR · ICCV · ECCV</p>
      <h2 v-if="!$slots.default">{{ title }}</h2>
      <h2 v-else><slot /></h2>
    </div>
    <div class="venue-chips">
      <button
        v-for="name in ['CVPR', 'ICCV', 'ECCV']"
        :key="name"
        class="chip magnet"
        :class="[name, { off: !venues.includes(name) }]"
        @mousemove="magnetMove($event, 0.18)"
        @mouseleave="magnetLeave"
        @click="toggleVenue(name)"
      >
        <i></i>{{ name }}
      </button>
    </div>
  </div>
</template>
