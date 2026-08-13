<template>
  <div class="app">
    <nav class="nav" :class="{ 'nav--dark': navDark }">
      <div class="nav__inner">
        <router-link to="/" class="nav__logo">
          <img src="/assets/logo-transparent.png" alt="穹眸瞰陷" class="nav__logo-img" />
          <span>穹眸瞰陷</span>
        </router-link>
        <div class="nav__links">
          <router-link to="/">首页</router-link>
          <router-link to="/about">项目</router-link>
          <router-link to="/team">团队</router-link>
          <router-link to="/detect" class="nav__cta">检测系统</router-link>
        </div>
      </div>
    </nav>
    <main class="main-content">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    <footer class="footer">
      <div class="footer__inner">
        <span>穹眸瞰陷 &copy; 2026</span>
        <span>中国矿业大学（北京）能源与矿业学院</span>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { computed, onMounted, onBeforeUnmount, nextTick } from "vue"
import { useRoute, useRouter } from "vue-router"
const route = useRoute()
const router = useRouter()
const navDark = computed(() => route.path === "/")

/* Reveal observer */
let revealObserver = null
function observeReveals() {
  if (!revealObserver) return
  nextTick(() => {
    document.querySelectorAll(".reveal:not(.revealed)").forEach((el) => revealObserver.observe(el))
  })
}
onMounted(() => {
  revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry, i) => {
        if (entry.isIntersecting) {
          requestAnimationFrame(() => {
            setTimeout(() => entry.target.classList.add("revealed"), i * 80)
          })
          revealObserver.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.1, rootMargin: "0px 0px -48px 0px" }
  )
  observeReveals()
})
router.afterEach(() => setTimeout(() => observeReveals(), 500))
onBeforeUnmount(() => { if (revealObserver) revealObserver.disconnect() })
</script>

<style>
/* ======= DESIGN TOKENS — B&W + GOLD ONLY ======= */
:root {
  --gold: #C8924B;
  --gold-light: #d4a05a;
  --gold-dark: #a07030;
  --gold-dim: rgba(200,146,75,0.08);
  --black: #0a0a0a;
  --gray-900: #1d1d1f;
  --gray-700: #3a3a3c;
  --gray-600: #6e6e73;
  --gray-500: #86868b;
  --gray-400: #a1a1a6;
  --gray-300: #c7c7cc;
  --gray-200: #e5e5ea;
  --gray-150: #efeff1;
  --gray-100: #f5f5f7;
  --gray-50:  #fafafa;
  --white: #ffffff;
  --font: -apple-system, "SF Pro Display", "PingFang SC", "Helvetica Neue", system-ui, sans-serif;
  --font-mono: "SF Mono", "Cascadia Code", "Fira Code", monospace;
  --z-nav: 100;
  --radius-sm: 4px;
  --radius-md: 8px;
  --radius-lg: 14px;
  --radius-xl: 20px;
}

*,*::before,*::after { box-sizing: border-box; margin: 0; }
html { scroll-behavior: smooth; -webkit-font-smoothing: antialiased; }
body { font-family: var(--font); color: #fff; background: #050507; }
h1,h2,h3,h4 { text-wrap: balance; line-height: 1.15; }
p { text-wrap: pretty; line-height: 1.7; }
:focus-visible { outline: 2px solid var(--gold); outline-offset: 3px; border-radius: 2px; }

/* Nav */
.nav { position: fixed; top: 0; left: 0; right: 0; z-index: var(--z-nav); height: 56px; display: flex; align-items: center; transition: background 0.4s ease, backdrop-filter 0.4s ease; background: rgba(255,255,255,0.85); backdrop-filter: blur(20px); -webkit-backdrop-filter: blur(20px); }
.nav--dark { background: transparent; backdrop-filter: none; -webkit-backdrop-filter: none; }
.nav__inner { max-width: 1200px; width: 100%; margin: 0 auto; padding: 0 28px; display: flex; align-items: center; justify-content: space-between; }
.nav__logo { display: flex; align-items: center; gap: 8px; text-decoration: none; color: var(--black); font-size: 16px; font-weight: 600; letter-spacing: 0.02em; }
.nav--dark .nav__logo { color: white; }
.nav__logo-img { height: 28px; width: auto; border-radius: 4px; }
.nav__links { display: flex; align-items: center; gap: 28px; font-size: 13px; font-weight: 500; }
.nav__links a { text-decoration: none; color: rgba(0,0,0,0.6); transition: color 0.25s; position: relative; padding: 4px 0; }
.nav--dark .nav__links a { color: rgba(255,255,255,0.65); }
.nav__links a:hover, .nav__links a.router-link-exact-active { color: var(--gold); }
.nav__links a::after { content: ""; position: absolute; bottom: -2px; left: 0; right: 0; height: 1.5px; background: var(--gold); transform: scaleX(0); transition: transform 0.25s; }
.nav__links a.router-link-exact-active::after { transform: scaleX(1); }
.nav__cta { background: var(--gold) !important; color: #fff !important; padding: 5px 16px !important; border-radius: 18px; font-weight: 600; transition: all 0.2s !important; }
.nav__cta::after { display: none !important; }
.nav__cta:hover { background: var(--gold-light) !important; transform: scale(1.04); }
.nav__cta:active { transform: scale(0.96) !important; }

/* Page transition */
.page-enter-active, .page-leave-active { transition: opacity 0.35s ease, transform 0.35s ease; }
.page-enter-from { opacity: 0; transform: translateY(12px); }
.page-leave-to { opacity: 0; transform: translateY(-8px); }

.main-content { min-height: 100vh; }

/* Reveal */
.reveal { opacity: 0; transform: translateY(28px); transition: opacity 0.75s cubic-bezier(0.16,1,0.3,1), transform 0.75s cubic-bezier(0.16,1,0.3,1); }
.reveal.revealed { opacity: 1; transform: translateY(0); }

/* Button system */
.btn { display: inline-flex; align-items: center; gap: 8px; padding: 13px 28px; border-radius: 24px; font-size: 14px; font-weight: 600; text-decoration: none; cursor: pointer; border: none; font-family: var(--font); transition: all 0.28s cubic-bezier(0.25,0.1,0.25,1); }
.btn:active { transform: scale(0.97); }
.btn--gold { background: var(--gold); color: #fff; }
.btn--gold:hover { background: var(--gold-light); transform: translateY(-2px); box-shadow: 0 8px 28px rgba(200,146,75,0.35); }
.btn--gold:active { transform: scale(0.97) translateY(0); box-shadow: 0 2px 8px rgba(200,146,75,0.2); }
.btn--ghost { background: transparent; color: rgba(255,255,255,0.7); border: 1px solid rgba(255,255,255,0.18); }
.btn--ghost:hover { border-color: rgba(255,255,255,0.45); color: #fff; transform: translateY(-2px); }
.btn--ghost:active { transform: scale(0.97) translateY(0); }
.btn--outline { background: transparent; color: var(--black); border: 1px solid var(--gray-300); }
.btn--outline:hover { border-color: var(--black); transform: translateY(-1px); }
.btn--outline:active { transform: scale(0.97); }

/* Footer */
.footer { background: #0b0b0f; border-top: 1px solid rgba(255, 255, 255, 0.06); padding: 32px 24px; }
.footer__inner { max-width: 1200px; margin: 0 auto; display: flex; justify-content: space-between; align-items: center; font-size: 12px; color: rgba(255,255,255,0.4); }
@media (max-width: 640px) { .footer__inner { flex-direction: column; gap: 6px; text-align: center; } }

/* Scrollbar */
::-webkit-scrollbar { width: 5px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: var(--gray-300); border-radius: 3px; }

/* Utility: page-hero shared by sub-pages */
.page-hero { padding: 120px 24px 56px; background: var(--black); text-align: center; }
.page-hero__inner { max-width: 680px; margin: 0 auto; }
.page-hero__title { font-size: clamp(36px, 6vw, 52px); font-weight: 700; color: #fff; letter-spacing: -0.02em; animation: fadeUp 0.7s cubic-bezier(0.16,1,0.3,1); }
.page-hero__sub { font-size: 16px; color: var(--gold); margin-top: 10px; font-weight: 400; animation: fadeUp 0.7s 0.1s both cubic-bezier(0.16,1,0.3,1); }
@keyframes fadeUp { from { opacity: 0; transform: translateY(16px); } to { opacity: 1; transform: translateY(0); } }

/* Utility: section */
.section { padding: 88px 24px; }
.section--dark { background: var(--black); color: #fff; }
.section--gray { background: var(--gray-50); }
.section__inner { max-width: 1080px; margin: 0 auto; }
.section__heading { font-size: clamp(26px, 4vw, 34px); font-weight: 700; color: #fff; margin-bottom: 44px; letter-spacing: -0.01em; }
.section__heading--center { text-align: center; }
.section--dark .section__heading { color: #fff; }

@media (max-width: 768px) {
  .nav__links { gap: 18px; font-size: 12px; }
  .section { padding: 60px 20px; }
  .section__heading { margin-bottom: 28px; }
}
</style>
