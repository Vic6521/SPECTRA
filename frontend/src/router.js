import { createRouter, createWebHistory } from "vue-router";
import OverviewView from "./views/OverviewView.vue";
import TrendView from "./views/TrendView.vue";
import EvoView from "./views/EvoView.vue";
import PapersView from "./views/PapersView.vue";
import CrawlView from "./views/CrawlView.vue";
import AboutView from "./views/AboutView.vue";

export const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: "/", name: "overview", component: OverviewView },
    { path: "/trend", name: "trend", component: TrendView },
    { path: "/evo", name: "evo", component: EvoView },
    { path: "/papers", name: "papers", component: PapersView },
    { path: "/crawl", name: "crawl", component: CrawlView },
    { path: "/about", name: "about", component: AboutView },
  ],
});
