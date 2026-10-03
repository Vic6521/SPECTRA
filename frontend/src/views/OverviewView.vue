<script setup>
import { computed, inject, onMounted, reactive, ref, watch } from "vue";
import { useRouter } from "vue-router";
import { api } from "../api.js";
import KeywordGraph from "../components/KeywordGraph.vue";
import PaperDrawer from "../components/PaperDrawer.vue";
import SparkCard from "../components/SparkCard.vue";
import SparkHit from "../components/SparkHit.vue";
import CountUp from "../components/CountUp.vue";
import { magnetLeave, magnetMove } from "../motion/magnet.js";

const venues = inject("venues");
const toggleVenue = inject("toggleVenue");
const router = useRouter();
const stats = ref(null);
const related = ref([]);
const drawerTitle = ref("");
const drawerOpen = ref(false);
const activeCard = ref("papers");
const ticks = reactive({ papers: 0, keywords: 0, years: 0 });

async function load() {
  stats.value = await api.stats(venues);
}

function countOf(item) {
  return Math.round(Object.values(item.series || {}).reduce((a, b) => a + b, 0));
}

async function openKeyword(key) {
  drawerTitle.value = key;
  const data = await api.papers({ q: key, venues: venues.join(",") });
  related.value = data.papers.filter((p) => (p.keywords || []).includes(key));
  drawerOpen.value = true;
}

function selectCard(id) {
  activeCard.value = id;
  if (id in ticks) ticks[id] += 1;
}

onMounted(load);
watch(venues, load, { deep: true });
const maxHeat = computed(() => stats.value?.top?.[0]?.heat || 1);
</script>

<template>
  <section>
    <div class="dash-banner" v-if="stats">
      <div class="dash-main">
        <div class="dash-head">
          <div>
            <p class="kicker">SPECTRA / 本机光谱</p>
            <h2>把三大会的热点，<br />摊成可见的光谱。</h2>
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
        <div class="dash-cards">
          <SparkCard
            featured
            :active="activeCard === 'papers'"
            @select="selectCard('papers')"
          >
            <p class="dash-mini-label">入库论文</p>
            <strong><CountUp :to="stats.paperCount" :replay="ticks.papers" /></strong>
            <small>只算本机文库</small>
          </SparkCard>
          <SparkCard
            :active="activeCard === 'keywords'"
            @select="selectCard('keywords')"
          >
            <p class="dash-mini-label">追踪关键词</p>
            <strong><CountUp :to="stats.keywordCount" :replay="ticks.keywords" /></strong>
            <small>持续聚合中</small>
          </SparkCard>
          <SparkCard
            :active="activeCard === 'years'"
            @select="selectCard('years')"
          >
            <p class="dash-mini-label">年份窗口</p>
            <strong class="years">{{ stats.years }}</strong>
            <small>CVPR / ICCV / ECCV</small>
          </SparkCard>
        </div>
      </div>
      <img class="dash-art" src="/art/venue-stickers.png" alt="CVPR ICCV ECCV" />
    </div>
    <div class="split" v-if="stats">
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="kicker">热词排行</p>
            <h3>Top 10 热门方向</h3>
          </div>
          <router-link class="linkish" to="/evo">查看全部 →</router-link>
        </div>
        <SparkHit
          v-for="(item, i) in stats.top"
          :key="item.k"
          as="button"
          type="button"
          class="rank-row"
          @hit="openKeyword(item.k)"
        >
          <span class="no">{{ String(i + 1).padStart(2, "0") }}</span>
          <span>{{ item.k }}</span>
          <div class="track"><i :style="{ width: `${(100 * item.heat) / maxHeat}%` }"></i></div>
          <span class="rank-n">{{ countOf(item) }} 篇</span>
        </SparkHit>
      </div>
      <div class="panel">
        <div class="panel-head">
          <div>
            <p class="kicker">关联探索</p>
            <h3>关键词共现网络</h3>
          </div>
          <span class="live">● LIVE</span>
        </div>
        <KeywordGraph :nodes="stats.graph.nodes" @select="openKeyword" />
      </div>
    </div>
    <div class="cta">
      <div class="cta-icon">✦</div>
      <div>
        <p class="kicker">发现新的论文？</p>
        <h3>把新的信号，加入这片光谱。</h3>
      </div>
      <button class="btn primary" @click="router.push('/crawl')">去采集中心 →</button>
    </div>
    <PaperDrawer
      :open="drawerOpen"
      :title="drawerTitle"
      :papers="related"
      @close="drawerOpen = false"
    />
  </section>
</template>
