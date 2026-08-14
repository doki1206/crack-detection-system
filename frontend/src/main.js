import { createApp } from "vue"
import { createRouter, createWebHashHistory } from "vue-router"
import "./style.css"
import "./liquid-glass.css"
import App from "./App.vue"
import HomePage from "./views/HomePage.vue"
import AboutPage from "./views/AboutPage.vue"
import TeamPage from "./views/TeamPage.vue"

// 检测页懒加载：html2canvas / jsPDF 不进入首屏包
const DetectPage = () => import("./views/DetectPage.vue")

const routes = [
  { path: "/", component: HomePage },
  { path: "/about", component: AboutPage },
  { path: "/team", component: TeamPage },
  { path: "/detect", component: DetectPage },
]

const router = createRouter({
  history: createWebHashHistory(),
  routes,
  scrollBehavior() {
    return { top: 0 }
  },
})

createApp(App).use(router).mount("#app")
