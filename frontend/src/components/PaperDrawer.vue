<script setup>
import { computed } from "vue";

const props = defineProps({
  open: Boolean,
  title: { type: String, default: "" },
  papers: { type: Array, default: () => [] },
  paper: { type: Object, default: null },
});
const emit = defineEmits(["close", "edit", "star"]);
const current = computed(() => props.paper || (props.papers.length === 1 ? props.papers[0] : null));
const list = computed(() => (current.value ? [] : props.papers));
</script>

<template>
  <aside class="drawer" :class="{ open }">
    <div class="drawer-top">
      <p class="kicker">{{ current ? "论文详情" : "相关论文" }}</p>
      <button class="icon-btn" aria-label="关闭" @click="emit('close')">✕</button>
    </div>
    <h4>{{ current ? current.title : title }}</h4>

    <template v-if="current">
      <div class="field"><label>会议</label><span class="badge" :class="current.venue">{{ current.venue }}</span></div>
      <div class="field"><label>年份</label><p>{{ current.year }}</p></div>
      <div class="field"><label>关键词</label><p>{{ (current.keywords || []).join(" · ") }}</p></div>
      <div class="field"><label>摘要</label><p class="muted">{{ current.abstract || "暂无摘要" }}</p></div>
      <div class="field">
        <label>原文链接</label>
        <p v-if="current.link">
          <a :href="current.link" target="_blank" rel="noopener">打开这篇论文</a>
          <span class="muted" style="display:block;margin-top:6px;word-break:break-all">{{ current.link }}</span>
        </p>
        <p v-else class="muted">暂无</p>
      </div>
      <div class="drawer-foot">
        <button class="btn ghost" v-if="current.id" @click="emit('star', current)">
          {{ current.starred ? "已收藏" : "收藏" }}
        </button>
        <button class="btn primary" @click="emit('edit', current)">编辑</button>
      </div>
    </template>

    <template v-else>
      <p v-if="!list.length" class="muted">该词下暂无论文。</p>
      <article v-for="p in list" :key="p.id" class="drawer-card">
        <div>
          <span class="badge" :class="p.venue">{{ p.venue }}</span>
          <small class="muted"> {{ p.year }}</small>
        </div>
        <h4>{{ p.title }}</h4>
        <p class="muted">{{ p.abstract }}</p>
        <p v-if="p.link"><a :href="p.link" target="_blank" rel="noopener">打开这篇论文</a></p>
      </article>
    </template>
  </aside>
</template>
