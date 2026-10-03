<script setup>
import { onMounted, onUnmounted, provide, reactive, ref, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import Lenis from "lenis";
import "lenis/dist/lenis.css";

const router = useRouter();
const route = useRoute();
const venues = reactive(["CVPR", "ICCV", "ECCV"]);
const toastMsg = ref("");
const search = ref("");
let toastTimer = 0;

function toast(msg) {
  toastMsg.value = msg;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { toastMsg.value = ""; }, 2200);
}

function toggleVenue(name) {
  const idx = venues.indexOf(name);
  if (idx >= 0) {
    if (venues.length === 1) return;
    venues.splice(idx, 1);
  } else venues.push(name);
}

function onSearch(event) {
  if (event.key !== "Enter") return;
  router.push({ name: "papers", query: { q: search.value } });
}

watch(
  () => [route.name, route.query.q],
  () => {
    if (route.name === "papers") {
      search.value = typeof route.query.q === "string" ? route.query.q : "";
    }
  },
  { immediate: true },
);

provide("venues", venues);
provide("toggleVenue", toggleVenue);
provide("toast", toast);

let lenis = null;
onMounted(() => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  lenis = new Lenis({ autoRaf: true, duration: 1.25, smoothWheel: true, lerp: 0.08 });
});
onUnmounted(() => {
  lenis?.destroy();
  lenis = null;
});
</script>

<template>
  <div class="shell">
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark">S</div>
        <strong>SPECTRA</strong>
      </div>
      <p class="side-label">本机研究工作台</p>
      <nav class="nav">
        <router-link to="/">
          <svg viewBox="0 0 24 24"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
          总览
        </router-link>
        <router-link to="/trend">
          <svg viewBox="0 0 24 24"><path d="M4 16l5-5 4 3 7-8"/><path d="M4 20h16"/></svg>
          热度走势
        </router-link>
        <router-link to="/evo">
          <svg viewBox="0 0 24 24"><path d="M4 7h16M4 12h16M4 17h10"/></svg>
          年度演变
        </router-link>
        <router-link to="/papers">
          <svg viewBox="0 0 24 24"><path d="M7 3h8l5 5v13a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1V4a1 1 0 0 1 1-1z"/><path d="M15 3v6h6"/></svg>
          论文库
        </router-link>
        <router-link to="/crawl">
          <svg viewBox="0 0 24 24"><path d="M7 17a5 5 0 1 1 1.5-9.8A6 6 0 0 1 20 12a4 4 0 0 1-1 7.9H8"/></svg>
          采集
        </router-link>
        <router-link to="/about">
          <svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 10v7M12 7h.01"/></svg>
          了解更多
        </router-link>
      </nav>
      <div class="side-art">
        <img src="/art/sidebar-illustration.png" alt="热词观测插图" />
        <p>本机论文库 · 互不影响</p>
      </div>
    </aside>
    <div class="workspace">
      <header class="topbar">
        <div class="search">
          <svg width="16" height="17" viewBox="0 0 16 17" fill="none">
            <circle cx="7" cy="7.5" r="5.2" stroke="#93979F" stroke-width="1.4"/>
            <path d="M11 11.8L14.2 15" stroke="#93979F" stroke-width="1.4" stroke-linecap="round"/>
          </svg>
          <input
            v-model="search"
            placeholder="搜索论文标题 / 关键词 / 编号"
            aria-label="搜索论文标题 / 关键词 / 编号"
            @keydown="onSearch"
          />
        </div>
        <div class="top-status">
          <span class="live-dot"></span>
          2022–2026
        </div>
        <img class="avatar" src="/art/cloud-cartoon.png" alt="SPECTRA" />
      </header>
      <main class="content">
        <router-view v-slot="{ Component, route }">
          <transition name="page" mode="out-in">
            <component :is="Component" :key="route.path" />
          </transition>
        </router-view>
      </main>
    </div>
  </div>
  <div class="toast" :class="{ show: toastMsg }">{{ toastMsg }}</div>
</template>
