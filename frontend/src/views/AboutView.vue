<script setup>
import { computed, ref } from "vue";
import PageHero from "../components/PageHero.vue";

const venues = [
  {
    id: "CVPR",
    tone: "blue",
    moon: "◒",
    cycle: "每年举行",
    nameZh: "国际计算机视觉与模式识别会议",
    full: "IEEE / CVF Conference on Computer Vision and Pattern Recognition",
    site: "https://cvpr.thecvf.com/",
    siteLabel: "cvpr.thecvf.com",
    body: "计算机视觉与模式识别领域规模最大的年度顶会之一，由 IEEE 与 Computer Vision Foundation（CVF）主办。议题覆盖识别、检测、三维重建、生成模型、多模态与自动驾驶等。会议通常在每年春夏召开，论文开放获取入口在 CVF Open Access。",
  },
  {
    id: "ICCV",
    tone: "purple",
    moon: "◐",
    cycle: "奇数年举行",
    nameZh: "国际计算机视觉大会",
    full: "IEEE / CVF International Conference on Computer Vision",
    site: "https://iccv.thecvf.com/",
    siteLabel: "iccv.thecvf.com",
    body: "国际计算机视觉大会，与 CVPR、ECCV 并称计算机视觉三大顶会。奇数年举办，由 IEEE 与 CVF 主办。更侧重视觉基础问题与新方法，录用论文同样可在 CVF Open Access 阅读。",
  },
  {
    id: "ECCV",
    tone: "green",
    moon: "◓",
    cycle: "偶数年举行",
    nameZh: "欧洲计算机视觉国际会议",
    full: "European Conference on Computer Vision",
    site: "https://eccv.ecva.net/",
    siteLabel: "eccv.ecva.net",
    body: "欧洲计算机视觉大会，偶数年举办，由 European Computer Vision Association（ECVA）组织。论文传统上收入 Springer LNCS，开放版本多在 ECVA 或作者 arXiv。与 CVPR、ICCV 交替出现在年份轴上。",
  },
];

const selectedId = ref("");
const selected = computed(() => venues.find((v) => v.id === selectedId.value) || null);

function openVenue(id) {
  selectedId.value = selectedId.value === id ? "" : id;
}
</script>

<template>
  <section>
    <PageHero title="了解更多" />
    <div class="about-grid">
      <button
        v-for="item in venues"
        :key="item.id"
        type="button"
        class="about-card"
        :class="[item.tone, { on: selectedId === item.id }]"
        :aria-pressed="selectedId === item.id"
        @click="openVenue(item.id)"
      >
        <div class="moon">{{ item.moon }}</div>
        <p class="kicker">{{ item.cycle }}</p>
        <h3>{{ item.id }}</h3>
        <p class="muted">{{ item.nameZh }}</p>
      </button>
    </div>
    <div class="panel about-detail" v-if="selected" :class="selected.tone">
      <p class="kicker">顶会背景</p>
      <h3>{{ selected.id }}</h3>
      <p class="muted">{{ selected.full }} · {{ selected.cycle }}</p>
      <p class="about-body">{{ selected.body }}</p>
      <a class="btn primary" :href="selected.site" target="_blank" rel="noopener">
        打开官网 {{ selected.siteLabel }}
      </a>
    </div>
    <p v-else class="about-hint muted">点击上方卡片，查看该顶会的背景介绍和官网。</p>
    <div class="panel" style="margin-top:18px">
      <p class="kicker">统计口径</p>
      <h3>热度怎么算</h3>
      <p class="formula">heat = freq × (1 + 0.5 × growth)</p>
      <p class="muted">
        freq 为当前论文库中该词出现次数；growth 用 2025–2026 相对 2022–2024 的变化，截断到 [-1, 3]。
        这是本平台的相对热度，不是三大会全量排名。
      </p>
      <div class="meta-grid">
        <span class="muted">数据来源</span>
        <strong>DBLP、arXiv、CVF / ECVA 公开论文</strong>
        <span class="muted">使用范围</span>
        <strong>公开试用 · CVPR / ICCV / ECCV · 2022–2026</strong>
        <span class="muted">论文库存放</span>
        <strong>本机浏览器 localStorage，换设备不同步</strong>
        <span class="muted">彼此隔离</span>
        <strong>每人一份文库，采集与收藏互不影响</strong>
      </div>
    </div>
  </section>
</template>
