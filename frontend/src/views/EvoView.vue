<script setup>
import { inject, onMounted, ref, watch } from "vue";
import { api, YEARS } from "../api.js";
import PaperDrawer from "../components/PaperDrawer.vue";
import PageHero from "../components/PageHero.vue";
import SparkHit from "../components/SparkHit.vue";

const venues = inject("venues");
const year = ref(2022);
const ranked = ref([]);
const prevKeys = ref([]);
const related = ref([]);
const drawerOpen = ref(false);
const drawerTitle = ref("");
const maxScore = ref(1);

function tag(item, i) {
  const was = prevKeys.value.indexOf(item.k);
  if (was < 0) return { t: "New", c: "new" };
  if (was > i) return { t: "↑", c: "" };
  if (was < i) return { t: "↓", c: "" };
  return { t: "→", c: "" };
}

async function load() {
  const data = await api.stats(venues);
  const current = data.all.map((x) => ({
    ...x,
    yearScore: x.series[year.value] || 0,
  })).filter((x) => x.yearScore > 0).sort((a, b) => b.yearScore - a.yearScore).slice(0, 10);
  const prevYear = year.value - 1;
  prevKeys.value = data.all.map((x) => ({
    ...x,
    yearScore: x.series[prevYear] || 0,
  })).filter((x) => x.yearScore > 0).sort((a, b) => b.yearScore - a.yearScore).map((x) => x.k);
  ranked.value = current;
  maxScore.value = current[0]?.yearScore || 1;
}

async function openKeyword(key) {
  drawerTitle.value = key;
  const data = await api.papers({ q: key, venues: venues.join(",") });
  related.value = data.papers.filter((p) => (p.keywords || []).includes(key));
  drawerOpen.value = true;
}

onMounted(load);
watch([venues, year], load, { deep: true });
</script>

<template>
  <section>
    <PageHero title="年度演变" />
    <div class="year-pills">
      <button v-for="y in YEARS" :key="y" :class="{ on: year === y }" @click="year = y">{{ y }}</button>
    </div>
    <div class="panel">
      <div class="panel-head">
        <div>
          <p class="kicker">年度排行</p>
          <h3>{{ year }} 的 Top 10</h3>
        </div>
      </div>
      <SparkHit
        v-for="(item, i) in ranked"
        :key="item.k"
        as="button"
        type="button"
        class="evo-row"
        @hit="openKeyword(item.k)"
      >
        <span class="no">{{ String(i + 1).padStart(2, "0") }}</span>
        <span>{{ item.k }}</span>
        <span class="tag" :class="tag(item, i).c">{{ tag(item, i).t }}</span>
        <div class="track"><i :style="{ width: `${(100 * item.yearScore) / maxScore}%` }"></i></div>
        <span class="rank-n">{{ item.yearScore }} 篇</span>
      </SparkHit>
    </div>
    <PaperDrawer :open="drawerOpen" :title="drawerTitle" :papers="related" @close="drawerOpen = false" />
  </section>
</template>
