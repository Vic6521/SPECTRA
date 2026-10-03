<script setup>
import { inject, onMounted, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { api } from "../api.js";
import PageHero from "../components/PageHero.vue";
import PaperDrawer from "../components/PaperDrawer.vue";

const venues = inject("venues");
const toast = inject("toast");
const route = useRoute();
const router = useRouter();
const query = ref(route.query.q || "");
const view = ref(route.query.view || "all");
const papers = ref([]);
const total = ref(0);
const editing = ref(null);
const deleting = ref(null);
const detail = ref(null);
const resetOpen = ref(false);
const form = reactive({
  title: "", venue: "CVPR", year: 2026, keywords: "", abstract: "", link: "",
});

const views = [
  { id: "all", label: "全部" },
  { id: "starred", label: "收藏" },
  { id: "recent", label: "最新入库" },
];

async function load() {
  const data = await api.papers({ q: query.value, venues: venues.join(","), view: view.value });
  papers.value = data.papers;
  total.value = data.total;
}

function setView(id) {
  view.value = id;
  const next = { ...route.query, view: id === "all" ? undefined : id };
  if (!next.view) delete next.view;
  router.push({ name: "papers", query: next });
}

function openForm(paper) {
  editing.value = paper ? paper.id : "";
  form.title = paper?.title || "";
  form.venue = paper?.venue || "CVPR";
  form.year = paper?.year || 2026;
  form.keywords = (paper?.keywords || []).join(", ");
  form.abstract = paper?.abstract || "";
  form.link = paper?.link || "";
}

async function save() {
  const body = { ...form, year: Number(form.year) };
  if (editing.value) await api.updatePaper(editing.value, body);
  else await api.createPaper(body);
  editing.value = null;
  detail.value = null;
  toast("已写入论文库");
  await load();
}

async function confirmDelete() {
  await api.deletePaper(deleting.value.id);
  deleting.value = null;
  toast("已删除");
  await load();
}

async function starPaper(paper) {
  const prev = !!paper.starred;
  const next = { ...paper, starred: !prev };
  papers.value = papers.value.map((p) => (p.id === paper.id ? next : p));
  if (detail.value?.id === paper.id) detail.value = next;
  try {
    const updated = await api.toggleStar(paper.id);
    papers.value = papers.value.map((p) => (p.id === updated.id ? updated : p));
    if (detail.value?.id === updated.id) detail.value = updated;
    toast(updated.starred ? "已收藏" : "已取消收藏");
    if (view.value === "starred" && !updated.starred) await load();
  } catch (err) {
    papers.value = papers.value.map((p) => (p.id === paper.id ? { ...p, starred: prev } : p));
    if (detail.value?.id === paper.id) detail.value = { ...detail.value, starred: prev };
    toast(err.message || "收藏失败");
  }
}

async function restoreSeed() {
  await api.resetToSeed();
  resetOpen.value = false;
  toast("已恢复官方示意库");
  await load();
}

function wipeLibrary() {
  api.clearLibrary();
  resetOpen.value = false;
  toast("本机论文库已清空");
  load();
}

function goCrawl() {
  router.push({ name: "crawl", query: { title: query.value } });
}

function onEditFromDrawer(paper) {
  detail.value = null;
  openForm(paper);
}

onMounted(load);
watch([venues, query, view], load, { deep: true });
watch(() => route.query.q, (q) => { query.value = typeof q === "string" ? q : ""; });
watch(() => route.query.view, (v) => { view.value = typeof v === "string" && v ? v : "all"; });
watch([papers, () => route.query.open], () => {
  const id = route.query.open;
  if (typeof id !== "string" || !id) return;
  const hit = papers.value.find((p) => p.id === id);
  if (hit) detail.value = hit;
});

function clearQuery() {
  query.value = "";
  const next = { ...route.query };
  delete next.q;
  router.push({ name: "papers", query: next });
}
</script>

<template>
  <section>
    <PageHero title="论文库" />
    <div class="panel paper-card">
      <div class="paper-toolbar">
        <div>
          <p class="kicker">本机论文库</p>
          <h3>论文库</h3>
          <p class="muted paper-count" v-if="!query">{{ view === "starred" ? "收藏" : view === "recent" ? "最近写入" : "共" }} {{ total }} 篇 · 只存在这台浏览器</p>
          <p class="muted paper-count" v-else>
            正在查找「{{ query }}」，显示 {{ total }} 篇
            <button class="linkish" type="button" @click="clearQuery">查看全部</button>
          </p>
        </div>
        <div class="paper-actions">
          <button class="btn ghost" type="button" @click="resetOpen = true">重置本机库</button>
          <button class="btn primary" @click="openForm(null)">＋ 添加论文</button>
        </div>
      </div>
      <div class="paper-filters">
        <button
          v-for="item in views"
          :key="item.id"
          class="chip"
          :class="{ off: view !== item.id }"
          @click="setView(item.id)"
        >{{ item.label }}</button>
      </div>
      <div class="banner" :class="{ show: query && total === 0 }">
        <div>论文库中没有「<strong>{{ query }}</strong>」。是否按该语句到公开源采集？</div>
        <button class="btn warn" @click="goCrawl">去采集</button>
      </div>
      <p v-if="!query && total === 0 && view === 'starred'" class="muted">还没有收藏。点列表里的星标即可。</p>
      <p v-if="!query && total === 0 && view === 'recent'" class="muted">还没有新写入的论文。去采集页预览后再写入。</p>
      <table>
        <thead>
          <tr>
            <th></th>
            <th>标题</th>
            <th>会议</th>
            <th>年份</th>
            <th>关键词</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="p in papers" :key="p.id">
            <td>
              <button
                class="star-btn"
                :class="{ on: p.starred }"
                :aria-label="p.starred ? '取消收藏' : '收藏'"
                @click.stop="starPaper(p)"
              >{{ p.starred ? "★" : "☆" }}</button>
            </td>
            <td>{{ p.title }}</td>
            <td><span class="badge" :class="p.venue">{{ p.venue }}</span></td>
            <td>{{ p.year }}</td>
            <td class="muted">{{ (p.keywords || []).join(" · ") }}</td>
            <td>
              <div class="row-actions">
                <button class="detail" @click="detail = p">详情</button>
                <span>·</span>
                <button class="edit" @click="openForm(p)">改</button>
                <span>·</span>
                <button class="del" @click="deleting = p">删</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <PaperDrawer
      :open="!!detail"
      :paper="detail"
      @close="detail = null"
      @edit="onEditFromDrawer"
      @star="starPaper"
    />

    <div class="modal-mask" :class="{ open: editing !== null }" @click.self="editing = null">
      <div class="modal wide">
        <h3>{{ editing ? "编辑论文" : "添加论文" }}</h3>
        <p class="muted">{{ editing ? "改的是会议、年份、关键词等脏数据。" : "手工新增只用于补全；主路径是采集后写入。" }}</p>
        <div class="field"><label>标题</label><input v-model="form.title" /></div>
        <div class="field"><label>会议</label>
          <select v-model="form.venue">
            <option>CVPR</option><option>ICCV</option><option>ECCV</option>
          </select>
        </div>
        <div class="field"><label>年份</label><input v-model="form.year" type="number" min="2022" max="2026" /></div>
        <div class="field"><label>关键词</label><input v-model="form.keywords" placeholder="逗号分隔" /></div>
        <div class="field"><label>摘要</label><textarea v-model="form.abstract" rows="4"></textarea></div>
        <div class="field"><label>原文链接</label><input v-model="form.link" /></div>
        <div class="modal-actions">
          <button class="btn primary" @click="save">保存</button>
          <button class="btn ghost" @click="editing = null">取消</button>
        </div>
      </div>
    </div>
    <div class="modal-mask" :class="{ open: deleting }" @click.self="deleting = null">
      <div class="modal">
        <h3>确认删除这篇论文？</h3>
        <p class="muted">{{ deleting?.title }}。只从本机删除，别人的文库不受影响。</p>
        <div class="modal-actions">
          <button class="btn danger" @click="confirmDelete">删除</button>
          <button class="btn ghost" @click="deleting = null">取消</button>
        </div>
      </div>
    </div>
    <div class="modal-mask" :class="{ open: resetOpen }" @click.self="resetOpen = false">
      <div class="modal">
        <h3>重置本机论文库？</h3>
        <p class="muted">收藏、手工新增和采集写入都只在这台浏览器里。重置不会改服务器，也不会动其他人的库。</p>
        <div class="modal-actions">
          <button class="btn primary" @click="restoreSeed">恢复示意库</button>
          <button class="btn danger" @click="wipeLibrary">清空后自建</button>
          <button class="btn ghost" @click="resetOpen = false">取消</button>
        </div>
      </div>
    </div>
  </section>
</template>
