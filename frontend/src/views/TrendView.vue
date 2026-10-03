<script setup>
import { computed, inject, onMounted, onUnmounted, ref, watch } from "vue";
import { api, YEARS } from "../api.js";
import PaperDrawer from "../components/PaperDrawer.vue";
import PageHero from "../components/PageHero.vue";

const ROW_H = 58;
const REEL_H = 72;
const venues = inject("venues");
const trend = ref([]);
const frac = ref(0);
const playing = ref(false);
const related = ref([]);
const drawerOpen = ref(false);
const drawerTitle = ref("");
const entered = ref(false);
let raf = 0;
let last = 0;
let vel = 0;
let mode = "";

function lerp(a, b, t) { return a + (b - a) * t; }
function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - ((-2 * t + 2) ** 3) / 2; }
function morph(raw) {
  const i0 = Math.max(0, Math.min(YEARS.length - 1, Math.floor(raw)));
  return i0 + ease(Math.min(1, Math.max(0, raw - i0)));
}

function countsAt(item, raw) {
  const f = morph(raw);
  const i0 = Math.floor(f);
  const i1 = Math.min(i0 + 1, YEARS.length - 1);
  const t = f - i0;
  const a = item.byYearVenue[String(YEARS[i0])] || { CVPR: 0, ICCV: 0, ECCV: 0 };
  const b = item.byYearVenue[String(YEARS[i1])] || { CVPR: 0, ICCV: 0, ECCV: 0 };
  return {
    k: item.k,
    CVPR: lerp(a.CVPR || 0, b.CVPR || 0, t),
    ICCV: lerp(a.ICCV || 0, b.ICCV || 0, t),
    ECCV: lerp(a.ECCV || 0, b.ECCV || 0, t),
  };
}

function rows() {
  const values = trend.value.slice(0, 16).map((item) => {
    const c = countsAt(item, frac.value);
    return { ...c, n: c.CVPR + c.ICCV + c.ECCV };
  });
  const ranked = [...values].sort((a, b) => b.n - a.n);
  const visible = ranked.filter((v) => v.n > 0.04).slice(0, 8);
  const shown = new Set(visible.map((v) => v.k));
  const max = Math.max(1, ...visible.map((v) => v.n));
  return values.map((v) => {
    const rank = visible.findIndex((x) => x.k === v.k);
    return { ...v, max, rank, on: shown.has(v.k) };
  });
}

const yearNow = computed(() => YEARS[Math.round(frac.value)] || 2022);
const playhead = computed(() => `${(100 * frac.value) / Math.max(1, YEARS.length - 1)}%`);
const reelShift = computed(() => `translateY(${-frac.value * REEL_H}px)`);

async function load() {
  const data = await api.stats(venues);
  trend.value = data.trend;
  requestAnimationFrame(() => {
    entered.value = true;
    setTimeout(() => { entered.value = false; }, 1200);
  });
}

function stop() {
  playing.value = false;
  mode = "";
  cancelAnimationFrame(raf);
  raf = 0;
}

function play() {
  if (playing.value) {
    frac.value = morph(frac.value);
    stop();
    return;
  }
  stop();
  playing.value = true;
  mode = "play";
  if (frac.value >= YEARS.length - 1 - 0.01) frac.value = 0;
  last = 0;
  const tick = (ts) => {
    if (mode !== "play") return;
    if (!last) last = ts;
    frac.value += (ts - last) / 2000;
    last = ts;
    if (frac.value >= YEARS.length - 1) {
      frac.value = YEARS.length - 1;
      stop();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function springTo(target) {
  stop();
  mode = "spring";
  vel = 0;
  last = 0;
  const damping = 40;
  const stiffness = 50;
  const tick = (ts) => {
    if (mode !== "spring") return;
    if (!last) last = ts;
    const dt = Math.min(0.032, (ts - last) / 1000);
    last = ts;
    const acc = (target - frac.value) * stiffness - vel * damping;
    vel += acc * dt;
    frac.value += vel * dt;
    if (Math.abs(target - frac.value) < 0.003 && Math.abs(vel) < 0.01) {
      frac.value = target;
      stop();
      return;
    }
    raf = requestAnimationFrame(tick);
  };
  raf = requestAnimationFrame(tick);
}

function onScrub(event) {
  stop();
  frac.value = Number(event.target.value);
}

async function openKeyword(key) {
  drawerTitle.value = key;
  const data = await api.papers({ q: key, venues: venues.join(",") });
  related.value = data.papers.filter((p) => (p.keywords || []).includes(key));
  drawerOpen.value = true;
}

onMounted(load);
watch(venues, () => { entered.value = false; load(); }, { deep: true });
onUnmounted(stop);
</script>

<template>
  <section>
    <PageHero title="热度走势" />
    <div class="trend-head">
      <div>
        <div class="year-reel">
          <div class="year-reel-window">
            <div class="year-reel-inner" :style="{ transform: reelShift }">
              <span v-for="y in YEARS" :key="y">{{ y }}</span>
            </div>
          </div>
          <small>年</small>
        </div>
      </div>
      <div class="legend">
        <span><i class="CVPR"></i>CVPR</span>
        <span><i class="ICCV"></i>ICCV</span>
        <span><i class="ECCV"></i>ECCV</span>
      </div>
    </div>
    <div class="panel">
      <div class="panel-head">
        <div>
          <h3>热度竞速</h3>
        </div>
        <button class="btn primary play-btn" @click="play">
          <span class="eq" :class="{ on: playing }" aria-hidden="true">
            <i></i><i></i><i></i><i></i><i></i>
          </span>
          {{ playing ? "暂停" : "播放" }}
        </button>
      </div>
      <p class="muted trend-note">
        当前是约 47 篇精选公开论文的示意库，不是全年录用全集。ICCV 奇数年、ECCV 偶数年开会，某年缺一种颜色是会议年历。
      </p>
      <div class="race-list" :style="{ height: `${8 * ROW_H}px` }">
        <div
          v-for="row in rows()"
          :key="row.k"
          class="race-row"
          :class="{ enter: entered, dim: !row.on }"
          :style="{
            transform: `translateY(${(row.rank < 0 ? 8 : row.rank) * ROW_H}px)`,
            '--i': Math.max(0, row.rank),
          }"
          @click="row.on && openKeyword(row.k)"
        >
          <span class="no">{{ String((row.rank < 0 ? 8 : row.rank) + 1).padStart(2, "0") }}</span>
          <strong>{{ row.k }}</strong>
          <div class="stack">
            <i
              v-if="row.CVPR > 0.04"
              class="seg"
              :style="{ width: `${(100 * row.CVPR) / row.max}%`, background: 'var(--cvpr)' }"
            ></i>
            <i
              v-if="row.ICCV > 0.04"
              class="seg"
              :style="{ width: `${(100 * row.ICCV) / row.max}%`, background: 'var(--iccv)' }"
            ></i>
            <i
              v-if="row.ECCV > 0.04"
              class="seg"
              :style="{ width: `${(100 * row.ECCV) / row.max}%`, background: 'var(--eccv)' }"
            ></i>
          </div>
          <span class="rank-n">
            {{ Math.round(row.n) }} 篇
            <small>
              <em v-if="Math.round(row.CVPR)" class="CVPR">{{ Math.round(row.CVPR) }}</em>
              <em v-if="Math.round(row.ICCV)" class="ICCV">{{ Math.round(row.ICCV) }}</em>
              <em v-if="Math.round(row.ECCV)" class="ECCV">{{ Math.round(row.ECCV) }}</em>
            </small>
          </span>
        </div>
      </div>
      <div class="timeline">
        <button class="play-dot" @click="play" :aria-label="playing ? '暂停' : '播放'">
          {{ playing ? "❚❚" : "▶" }}
        </button>
        <div class="tl-track">
          <input
            class="year-scrub"
            type="range"
            min="0"
            :max="YEARS.length - 1"
            step="0.01"
            :value="frac"
            aria-label="拖动年份"
            @input="onScrub"
          />
          <i class="playhead" :style="{ left: playhead }"></i>
          <div class="tl-years">
            <button
              v-for="(y, i) in YEARS"
              :key="y"
              :class="{ on: Math.round(frac) === i }"
              @click="springTo(i)"
            >
              <div class="dot"></div>
              {{ y }}
            </button>
          </div>
        </div>
      </div>
    </div>
    <PaperDrawer :open="drawerOpen" :title="drawerTitle" :papers="related" @close="drawerOpen = false" />
  </section>
</template>
