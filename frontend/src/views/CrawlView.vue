<script setup>
import { inject, onMounted, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api.js";
import PageHero from "../components/PageHero.vue";

const toast = inject("toast");
const route = useRoute();
const router = useRouter();
const tab = ref("single");
const title = ref(route.query.title || "");
const preview = ref(null);
const batchText = ref("");
const batchPreview = ref([]);
const batchErrors = ref([]);
const progress = ref(0);
const busy = ref(false);

async function crawlOne() {
  busy.value = true;
  try {
    const data = await api.crawl(title.value, false);
    preview.value = data.paper;
    toast(data.exists ? "公开源已返回（本机库中已有同名）" : "采集完成，请确认后写入本机");
  } catch (err) {
    toast(err.message);
  } finally {
    busy.value = false;
  }
}

async function writeOne() {
  if (!preview.value) return toast("请先采集");
  busy.value = true;
  try {
    const data = await api.crawl(preview.value.title, true);
    toast("已写入本机论文库");
    const next = { view: "recent" };
    if (data.paper?.id) next.open = data.paper.id;
    router.push({ name: "papers", query: next });
  } catch (err) {
    toast(err.message);
  } finally {
    busy.value = false;
  }
}

async function crawlBatch() {
  const lines = batchText.value.split(/\n/).map((s) => s.trim()).filter(Boolean);
  if (!lines.length) return toast("请粘贴标题列表");
  busy.value = true;
  progress.value = 12;
  batchPreview.value = [];
  batchErrors.value = [];
  try {
    const data = await api.crawlBatch(batchText.value, false);
    progress.value = 100;
    batchPreview.value = data.papers || [];
    batchErrors.value = data.errors || [];
    toast(`采集到 ${data.count} 篇预览${data.errors?.length ? `，失败 ${data.errors.length}` : ""}，请确认后写入`);
  } catch (err) {
    toast(err.message);
  } finally {
    busy.value = false;
  }
}

async function writeBatch() {
  if (!batchPreview.value.length) return toast("请先采集");
  busy.value = true;
  try {
    const data = await api.crawlBatch("", true, batchPreview.value);
    toast(`已写入 ${data.count} 篇`);
    router.push({ name: "papers", query: { view: "recent" } });
  } catch (err) {
    toast(err.message);
  } finally {
    busy.value = false;
  }
}

onMounted(() => {
  if (route.query.title) title.value = String(route.query.title);
});
watch(() => route.query.title, (q) => { if (q) title.value = String(q); });
</script>

<template>
  <section>
    <PageHero title="采集" />
    <div class="tabs">
      <button class="btn" :class="{ primary: tab === 'single' }" @click="tab = 'single'">单篇采集</button>
      <button class="btn" :class="{ primary: tab === 'batch' }" @click="tab = 'batch'">批量采集</button>
    </div>

    <div class="panel crawl-panel" v-if="tab === 'single'">
      <div class="panel-head">
        <div>
          <p class="kicker">单篇采集</p>
          <h3>给我一个标题，<br />其余交给检索。</h3>
        </div>
        <img class="cloud" src="/art/cloud-cartoon.png" alt="" />
      </div>
      <div class="field">
        <input v-model="title" placeholder="输入论文标题、DOI 或公开链接" />
      </div>
      <div class="modal-actions">
        <button class="btn primary" :disabled="busy" @click="crawlOne">开始采集 →</button>
        <button class="btn ghost" :disabled="busy || !preview" @click="writeOne">写入论文库</button>
      </div>
      <div class="preview-box">
        <p class="kicker">采集预览</p>
        <template v-if="preview">
          <span class="badge" :class="preview.venue">{{ preview.venue }}</span>
          <small class="muted"> {{ preview.year }} · {{ preview.status }}</small>
          <h4>{{ preview.title }}</h4>
          <p class="muted">{{ preview.abstract }}</p>
          <p>{{ (preview.keywords || []).join(" · ") }}</p>
          <a v-if="preview.link" :href="preview.link" target="_blank" rel="noopener">原文链接</a>
        </template>
        <p v-else class="muted">将在这里展示摘要、关键词与原文链接。</p>
      </div>
    </div>

    <div class="panel crawl-panel" v-else>
      <div class="panel-head">
        <div>
          <p class="kicker">批量采集</p>
          <h3>一行一个标题，<br />先预览，再写入。</h3>
        </div>
      </div>
      <div class="field">
        <label>每行一个标题</label>
        <textarea
          v-model="batchText"
          rows="8"
          placeholder="A ConvNet for the 2020s&#10;DETRs with Collaborative Hybrid Assignments Training&#10;Grounding DINO: Marrying DINO with Grounded Pre-Training for Open-Set Object Detection"
        ></textarea>
      </div>
      <div class="progress"><i :style="{ width: progress + '%' }"></i></div>
      <div class="modal-actions">
        <button class="btn primary" :disabled="busy" @click="crawlBatch">开始采集 →</button>
        <button class="btn ghost" :disabled="busy || !batchPreview.length" @click="writeBatch">写入论文库</button>
      </div>
      <div class="preview-box batch-preview">
        <p class="kicker">采集预览</p>
        <p v-if="!batchPreview.length && !batchErrors.length" class="muted">将在这里列出每篇的会议、年份与摘要，确认后再写入。</p>
        <article v-for="(item, i) in batchPreview" :key="item.title + i" class="batch-item">
          <div>
            <span class="badge" :class="item.venue">{{ item.venue }}</span>
            <small class="muted"> {{ item.year }}</small>
            <small v-if="item.exists" class="muted"> · 库中已有同名</small>
          </div>
          <h4>{{ item.title }}</h4>
          <p class="muted">{{ item.abstract }}</p>
          <a v-if="item.link" :href="item.link" target="_blank" rel="noopener">原文链接</a>
        </article>
        <p v-for="err in batchErrors" :key="err.title" class="muted">{{ err.title }}：{{ err.error }}</p>
      </div>
    </div>
  </section>
</template>
