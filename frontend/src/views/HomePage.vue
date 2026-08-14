<template>
  <div class="home">
    <!-- ═══════════ Hero：3D 地球 + 无人机交互 ═══════════ -->
    <div class="hero" ref="heroRef">
      <div class="hero__bg"></div>
      <div class="hero__grain"></div>

      <div ref="canvasContainer" class="hero__canvas-container"></div>

      <div class="hero__content" ref="heroContentRef">
        <div class="hero__logo-wrap">
          <img src="/assets/logo-transparent.png" alt="" class="hero__logo" />
        </div>

        <h1 class="hero__title">
          <span class="hero__char" style="--i:0">穹</span>
          <span class="hero__char" style="--i:1">眸</span>
          <span class="hero__char hero__char--gap" style="--i:2">瞰</span>
          <span class="hero__char" style="--i:3">陷</span>
        </h1>
        <div class="hero__title-line"></div>

        <p class="hero__tagline">崇山智眸 &middot; 裂迹无遁</p>
        <p class="hero__desc">
          基于AI大模型的无人机地表裂缝智能检测系统<br />
          <span class="hero__org">中国矿业大学（北京）能源与矿业学院 &middot; 赴内蒙古鄂尔多斯社会实践团</span>
        </p>
        <div class="hero__actions">
          <router-link to="/detect" class="btn btn--gold">
            进入检测系统
            <svg width="16" height="16" viewBox="0 0 16 16">
              <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
            </svg>
          </router-link>
          <button type="button" class="btn btn--ghost" @click="scrollToFeatures">了解项目优势</button>
        </div>
      </div>

      <div class="hero__interactive-hint lg-glass">
        <div class="hint-pulse"></div>
        <span>[ 鼠标拖拽地球旋转 &middot; 划过地表触发无人机激光扫描与裂缝模拟 ]</span>
      </div>

      <div class="hero__scroll">
        <span>向下滚动</span>
        <svg width="18" height="18" viewBox="0 0 18 18">
          <path d="M4.5 6.75L9 11.25L13.5 6.75" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
        </svg>
      </div>
    </div>

    <!-- ═══════════ 滚动叙事章节：Apple 式层层递进 ═══════════ -->
    <div class="story" ref="storyRef">
      <section class="chapter" v-for="c in chapters" :key="c.title">
        <div class="chapter__sticky">
          <div class="chapter__inner">
            <h2 class="chapter__title font-serif">{{ c.title }}</h2>
            <p class="chapter__sub">{{ c.sub }}</p>
          </div>
        </div>
      </section>
    </div>

    <!-- ═══════════ 亮点数据条 ═══════════ -->
    <div class="strip">
      <div class="strip__inner lg-glass lg-glass--refract">
        <div class="strip__item" v-for="h in highlights" :key="h.label">
          <span class="strip__num">{{ h.num }}</span>
          <span class="strip__label">{{ h.label }}</span>
        </div>
      </div>
    </div>

    <!-- ═══════════ 核心能力 ═══════════ -->
    <section id="features" class="section section--features reveal">
      <div class="section__inner">
        <span class="section__subtitle">SYSTEM CAPABILITIES</span>
        <h2 class="section__heading section__heading--center font-premium">科技之眸 · 守护矿山安全</h2>
        <p class="section__summary">利用无人机搭载高清航拍模组，结合多模态大模型与计算机视觉，打破传统人工巡检时空限制，为矿山地表形变与采空裂缝监测注入智能基因。</p>

        <div class="features-grid">
          <div
            class="feature-card lg-card lg-glass--sheen"
            v-for="(f, i) in featureCards"
            :key="i"
            :style="{ transitionDelay: (i * 70) + 'ms' }"
          >
            <div class="feature-card__icon" v-html="f.icon"></div>
            <h3 class="feature-card__title">{{ f.title }}</h3>
            <p class="feature-card__desc">{{ f.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 技术链路 ═══════════ -->
    <section class="section section--dark section--pipeline reveal">
      <div class="section__inner">
        <span class="section__subtitle">TECHNICAL PIPELINE</span>
        <h2 class="section__heading section__heading--center font-premium">“空天-大模型”一体化闭环链路</h2>

        <div class="pipeline-flow">
          <div
            class="pipeline-step lg-card lg-glass--sheen"
            v-for="(step, idx) in pipelineSteps"
            :key="idx"
            :style="{ transitionDelay: (idx * 70) + 'ms' }"
          >
            <div class="pipeline-step__num">0{{ idx + 1 }}</div>
            <div class="pipeline-step__icon" v-html="step.icon"></div>
            <h3 class="pipeline-step__title">{{ step.title }}</h3>
            <p class="pipeline-step__desc">{{ step.desc }}</p>
            <div v-if="idx < pipelineSteps.length - 1" class="pipeline-step__connector">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                <path d="M5 12h14M12 5l7 7-7 7" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 实地验证 ═══════════ -->
    <section class="section section--achieve reveal">
      <div class="section__inner">
        <div class="achieve-layout">
          <div class="achieve-content">
            <span class="section__subtitle">FIELD PRACTICE</span>
            <h2 class="section__heading font-premium achieve-heading">
              <span class="achieve-heading__top">内蒙古鄂尔多斯 ·</span>
              <span class="achieve-heading__bot">酸刺沟煤矿实地部署</span>
            </h2>
            <p class="achieve-desc">
              本系统于 2026 年暑期在内蒙古鄂尔多斯<strong>酸刺沟煤矿</strong>（年产 1200 万吨特大型现代化矿井）成功进行实地应用验证。
            </p>
            <p class="achieve-desc">
              在采空区上方陡峭的碎石山坡与植被覆盖区域，传统地表沉陷观测站难以全天候部署。实践团利用自主规划航线无人机进行网格化扫描，实时回传高分辨率影像，AI 系统在裂缝宽度测量与几何形态分割中表现卓越，精度达到厘米级，极大地提升了采空塌陷预警的时效性。
            </p>
            <div class="achieve-stats">
              <div class="achieve-stat-card lg-glass lg-glass--sheen">
                <h4>1200万吨</h4>
                <p>特大型现代化矿井验证</p>
              </div>
              <div class="achieve-stat-card lg-glass lg-glass--sheen">
                <h4>厘米级</h4>
                <p>地表裂纹非接触式测宽</p>
              </div>
            </div>
          </div>
          <div class="achieve-visual">
            <div class="visual-border">
              <img src="/assets/hero-new.svg" alt="UAV Survey Path" class="visual-img" />
              <div class="visual-scanline"></div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ═══════════ 收尾 CTA ═══════════ -->
    <section class="section section--cta reveal">
      <div class="section__inner cta__inner">
        <h2 class="cta__title font-serif">让每一道裂缝<br />都被看见</h2>
        <p class="cta__sub">上传一张航拍影像 体验大模型驱动的地表裂缝智能检测</p>
        <router-link to="/detect" class="btn btn--gold btn--lg">
          立即体验检测
          <svg width="16" height="16" viewBox="0 0 16 16">
            <path d="M6 3L11 8L6 13" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
          </svg>
        </router-link>
      </div>
    </section>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue"
import { useThreeEarth } from "../composables/useThreeEarth.js"

const highlights = [
  { num: "鄂尔多斯", label: "实践地点" },
  { num: "AI 大模型", label: "核心技术" },
  { num: "无人机", label: "数据采集" },
  { num: "7 人", label: "团队成员" },
]

// Apple 式滚动叙事章节：短句 + 大字号，随滚动逐章浮现（无句号，逗号作空格）
const chapters = [
  {
    title: "大地的裂缝 是沉默的警报",
    sub: "采空沉陷发生之前 地表早已写下征兆 —— 只是肉眼 常常来不及看见",
  },
  {
    title: "无人机 替我们抵达",
    sub: "自主航线深入陡坡与采空区上空 网格化扫描 不遗漏一寸地表",
  },
  {
    title: "大模型 替我们读懂",
    sub: "多模态视觉大模型从零样本影像中 识别裂缝的形态 走向与风险",
  },
]

const featureCards = [
  {
    title: "多模态大模型识别",
    desc: "依托豆包大语言大模型与先进视觉算法，不仅能识别人工难以到达的陡峭山坡裂缝，还能精准判别裂缝走向与类型。",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12h6M12 9v6"/></svg>'
  },
  {
    title: "高精度像素标定",
    desc: "通过无人机飞行参数（高度、镜头GSD）自动建立像元与地标实物比率，实现非接触式厘米级甚至毫米级裂隙测宽。",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><path d="M4 4v16h16M4 20l16-16M15 20v-5h5"/></svg>'
  },
  {
    title: "地质灾害智能预警",
    desc: "系统支持横向、纵向沉陷裂纹类型归纳，并自动评估地表塌陷危险系数，生成工程级防护处理建议。",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0zM12 9v4M12 17h.01"/></svg>'
  },
  {
    title: "云端一键报告导出",
    desc: "将航拍检测的裂隙轮廓图像、走向、几何特征自动汇编，支持生成精美打印格式 PDF 报告，服务于工程安全汇报。",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>'
  }
]

const pipelineSteps = [
  {
    title: "无人机网格化采集",
    desc: "依据规划路线自主飞行，规避人工盲区，多视角超清拍摄地表面。",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>'
  },
  {
    title: "视觉特征分割提取",
    desc: "大模型多模态视觉处理，圈定开裂高危目标并绘制闭合几何轮廓。",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="M12 6v12M6 12h12"/></svg>'
  },
  {
    title: "物理定标测宽",
    desc: "结合无人机航高对图像畸变和比例标定，精确结算每一道裂缝特征。",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M8 12h8M12 8v8"/></svg>'
  },
  {
    title: "系统安全预警决策",
    desc: "归档并分类裂缝走向趋势，评估等级，支持导出工程建议报告。",
    icon: '<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>'
  }
]

const heroRef = ref(null)
const heroContentRef = ref(null)
const canvasContainer = ref(null)
const storyRef = ref(null)

function scrollToFeatures() {
  // 滚动到第一句叙事，让大标题直接完整出现在视野内（不继续下滑才可见）
  const ch = storyRef.value?.querySelector('.chapter')
  if (!ch) return
  const absTop = ch.getBoundingClientRect().top + window.scrollY
  const target = absTop - window.innerHeight * 0.42
  window.scrollTo({ top: target, behavior: 'smooth' })
}

// 3D 地球场景
useThreeEarth(canvasContainer)

/* ── 滚动引擎：Hero 视差淡出 + 章节进度驱动 ────────────── */
const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches
let rafId = null
let chapterEls = []

function updateScrollFX() {
  rafId = null
  const vh = window.innerHeight

  // Hero 内容视差：滚动时上移并淡出
  if (heroContentRef.value) {
    const y = Math.min(window.scrollY, vh)
    heroContentRef.value.style.transform = `translateY(${y * 0.32}px)`
    heroContentRef.value.style.opacity = String(Math.max(0, 1 - y / (vh * 0.62)))
  }

  // 章节：sticky 区间内计算进度，驱动淡入 → 停留 → 淡出
  for (const el of chapterEls) {
    const rect = el.getBoundingClientRect()
    if (rect.bottom < -vh || rect.top > vh * 2) continue // 视口外跳过
    const total = rect.height - vh
    const p = Math.min(1, Math.max(0, -rect.top / total))
    const inner = el.querySelector(".chapter__inner")
    if (!inner) continue
    let opacity
    if (p < 0.28) opacity = p / 0.28
    else if (p > 0.8) opacity = Math.max(0, 1 - (p - 0.8) / 0.2)
    else opacity = 1
    const enter = Math.min(1, p / 0.28)
    const shift = (1 - enter) * 48 - Math.max(0, p - 0.8) * 120
    const scale = 0.94 + 0.06 * enter
    inner.style.opacity = opacity.toFixed(3)
    inner.style.transform = `translateY(${shift.toFixed(1)}px) scale(${scale.toFixed(3)})`
  }
}

function onScroll() {
  if (!rafId) rafId = requestAnimationFrame(updateScrollFX)
}

onMounted(() => {
  if (reduceMotion) {
    // 降低动态偏好：章节直接常显
    chapterEls = []
    document.querySelectorAll(".chapter__inner").forEach(el => {
      el.style.opacity = "1"
      el.style.transform = "none"
    })
    return
  }
  chapterEls = storyRef.value ? Array.from(storyRef.value.querySelectorAll(".chapter")) : []
  window.addEventListener("scroll", onScroll, { passive: true })
  window.addEventListener("resize", onScroll, { passive: true })
  updateScrollFX()
})

onUnmounted(() => {
  window.removeEventListener("scroll", onScroll)
  window.removeEventListener("resize", onScroll)
  if (rafId) cancelAnimationFrame(rafId)
})
</script>

<style scoped>
/* ═══════ Hero ═══════ */
.hero {
  position: relative;
  min-height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(180deg, #0b0b0f 0%, #050507 100%);
  overflow: hidden;
}
.hero__bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 65% 55% at 50% 30%, rgba(200,146,75,0.06) 0%, transparent 60%),
              radial-gradient(ellipse 50% 50% at 15% 85%, rgba(200,146,75,0.03) 0%, transparent 55%);
  z-index: 0;
  pointer-events: none;
}
.hero__grain {
  position: absolute;
  inset: 0;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)' opacity='0.015'/%3E%3C/svg%3E");
  z-index: 1;
  pointer-events: none;
}

.hero__canvas-container {
  position: absolute;
  inset: 0;
  z-index: 2;
  cursor: grab;
}

.hero__content {
  position: relative;
  z-index: 3;
  text-align: center;
  padding: 0 24px;
  margin-top: -20px;
  pointer-events: none;
  animation: fadeUp 1.2s cubic-bezier(0.16,1,0.3,1);
  will-change: transform, opacity;
}
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(24px); }
  to { opacity: 1; transform: translateY(0); }
}

.hero__content a,
.hero__content button,
.hero__content .btn {
  pointer-events: auto;
}

.hero__logo-wrap { margin-bottom: 16px; animation: logoFloat 6s ease-in-out infinite; }
@keyframes logoFloat { 0%,100% { transform: translateY(0); } 50% { transform: translateY(-6px); } }
.hero__logo { width: 68px; height: auto; filter: drop-shadow(0 0 28px rgba(200,146,75,0.4)); }

/* ===== Premium Animated Title ===== */
.hero__title {
  font-family: 'Noto Serif SC', 'STKaiti', 'KaiTi', serif;
  font-size: clamp(52px, 10vw, 88px);
  font-weight: 900;
  letter-spacing: 0.08em;
  padding-left: 0.08em; /* 补偿末字符 trailing letter-spacing，保证视觉居中 */
  margin: 0 0 0;
  line-height: 1.1;
  display: flex;
  justify-content: center;
  gap: 0.02em;
}

.hero__char {
  display: inline-block;
  background: linear-gradient(
    135deg,
    #a07030 0%,
    #e8c878 25%,
    #ffe8b0 45%,
    #C8924B 55%,
    #d4a05a 75%,
    #a07030 100%
  );
  background-size: 200% 200%;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  filter: drop-shadow(0 4px 24px rgba(200, 146, 75, 0.3));
  animation:
    charEntrance 0.9s cubic-bezier(0.16, 1, 0.3, 1) calc(var(--i) * 0.12s) both,
    goldShimmer 4s ease-in-out calc(1.2s + var(--i) * 0.15s) infinite;
}
.hero__char--gap {
  margin-left: 0.12em;
}

@keyframes charEntrance {
  0% {
    opacity: 0;
    transform: translateY(40px) scale(0.7) rotateX(30deg);
    filter: drop-shadow(0 0 0 transparent) blur(8px);
  }
  60% {
    opacity: 1;
    transform: translateY(-6px) scale(1.04) rotateX(0deg);
    filter: drop-shadow(0 4px 32px rgba(200,146,75,0.5)) blur(0px);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1) rotateX(0deg);
    filter: drop-shadow(0 4px 24px rgba(200,146,75,0.3)) blur(0px);
  }
}

@keyframes goldShimmer {
  0%, 100% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
}

.hero__title-line {
  width: min(320px, 60vw);
  height: 2px;
  margin: 12px auto 20px;
  border-radius: 2px;
  background: linear-gradient(90deg, transparent, rgba(200,146,75,0.6), transparent);
  animation: lineSweep 1.8s cubic-bezier(0.16,1,0.3,1) 0.7s both;
  position: relative;
}
.hero__title-line::after {
  content: '';
  position: absolute;
  inset: -2px 0;
  background: linear-gradient(90deg, transparent 20%, rgba(232,200,120,0.5) 50%, transparent 80%);
  filter: blur(6px);
  animation: lineGlow 3s ease-in-out 1.5s infinite;
}
@keyframes lineSweep {
  from { transform: scaleX(0); opacity: 0; }
  to { transform: scaleX(1); opacity: 1; }
}
@keyframes lineGlow {
  0%, 100% { opacity: 0.4; }
  50% { opacity: 0.9; }
}

.hero__tagline {
  font-family: 'Inter', sans-serif;
  font-size: 17px;
  letter-spacing: 0.28em;
  padding-left: 0.28em; /* 居中补偿 */
  color: var(--gold);
  margin: 0 0 16px;
  font-weight: 500;
  text-shadow: 0 2px 8px rgba(0,0,0,0.5);
  animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.6s both;
}
.hero__desc {
  font-family: 'Inter', sans-serif;
  font-size: 14px;
  color: rgba(255,255,255,0.5);
  line-height: 1.78;
  margin: 0 0 36px;
  text-shadow: 0 1px 2px rgba(0,0,0,0.5);
  animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 0.8s both;
}
.hero__org { color: rgba(255,255,255,0.35); font-size: 12.5px; font-weight: 400; margin-top: 4px; display: inline-block; }
.hero__actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  flex-wrap: wrap;
  animation: fadeUp 1s cubic-bezier(0.16,1,0.3,1) 1.0s both;
}

.hero__interactive-hint {
  position: absolute;
  bottom: 84px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  align-items: center;
  gap: 10px;
  color: rgba(220, 185, 130, 0.75);
  font-size: 11px;
  letter-spacing: 0.08em;
  pointer-events: none;
  padding: 8px 16px;
  border-radius: 999px;
  white-space: nowrap;
}
.hint-pulse {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--gold);
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.3; }
  50% { transform: scale(1.5); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.3; }
}

.hero__scroll {
  position: absolute;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 3;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  color: rgba(255,255,255,0.3);
  font-size: 10px;
  letter-spacing: 0.15em;
  pointer-events: none;
  animation: scrollPulse 2.2s ease-in-out infinite;
}
@keyframes scrollPulse { 0%,100% { opacity: 0.3; transform: translate(-50%, 0); } 50% { opacity: 0.7; transform: translate(-50%, 4px); } }

/* ═══════ 滚动叙事章节（Apple 式 sticky 递进）═══════ */
.story {
  position: relative;
  background:
    radial-gradient(ellipse 60% 40% at 50% 20%, rgba(200,146,75,0.05) 0%, transparent 60%),
    linear-gradient(180deg, #050507 0%, #0a0a0e 50%, #050507 100%);
}
.chapter {
  height: 190dvh;
  position: relative;
}
.chapter__sticky {
  position: sticky;
  top: 0;
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
.chapter__inner {
  text-align: center;
  padding: 0 24px;
  max-width: 1100px;
  opacity: 0;
  will-change: transform, opacity;
}
.chapter__title {
  font-family: 'Noto Serif SC', 'STKaiti', 'KaiTi', serif;
  font-size: clamp(24px, 4.8vw, 76px);
  font-weight: 900;
  line-height: 1.25;
  letter-spacing: 0.02em;
  padding-left: 0.02em;
  white-space: nowrap; /* 一句话一行，不被折断 */
  background: linear-gradient(160deg, #f5e3c0 0%, #e8c878 40%, #C8924B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 26px;
  filter: drop-shadow(0 6px 32px rgba(200, 146, 75, 0.18));
}
.chapter__sub {
  font-size: clamp(13px, 1.7vw, 18px);
  line-height: 1.7;
  white-space: nowrap;
  color: rgba(255, 255, 255, 0.55);
  max-width: 900px;
  margin: 0 auto;
}

/* ═══════ 数据条 ═══════ */
.strip { position: relative; z-index: 5; padding: 24px 20px 0; }
.strip__inner {
  max-width: 960px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-radius: var(--radius-xl);
  overflow: hidden;
}
.strip__item { position: relative; background: transparent; padding: 30px 20px; text-align: center; transition: all 0.3s ease; }
.strip__item + .strip__item::before {
  content: "";
  position: absolute;
  left: 0;
  top: 24%;
  bottom: 24%;
  width: 1px;
  background: rgba(255, 255, 255, 0.07);
}
.strip__item:hover { background: rgba(255, 255, 255, 0.04); }
.strip__num { display: block; font-size: 24px; font-weight: 700; color: var(--gold); margin-bottom: 4px; text-shadow: 0 2px 8px rgba(200, 146, 75, 0.2); }
.strip__label { display: block; font-size: 12px; color: rgba(255,255,255,0.45); letter-spacing: 0.08em; padding-left: 0.08em; }

/* ═══════ 通用小节标题 ═══════ */
.section__subtitle {
  display: block;
  text-align: center;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  padding-left: 0.2em; /* 居中补偿 */
  color: var(--gold);
  margin-bottom: 14px;
  text-transform: uppercase;
}
.font-premium {
  font-family: var(--font);
  letter-spacing: -0.02em;
}
.section__summary {
  max-width: 720px;
  margin: 0 auto 56px;
  text-align: center;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.45);
}

/* ═══════ 核心能力：2×2 大瓷贴，杜绝 3+1 破行 ═══════ */
.section--features {
  background: linear-gradient(180deg, #0b0b0f 0%, #050507 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.02);
}
.features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 24px;
  max-width: 920px;
  margin: 0 auto;
}
.feature-card {
  padding: 44px 40px;
}
.feature-card__icon {
  background: rgba(200, 146, 75, 0.06);
  width: 52px;
  height: 52px;
  border-radius: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 26px;
  border: 1px solid rgba(200, 146, 75, 0.12);
  transition: transform 0.35s;
}
.feature-card:hover .feature-card__icon {
  transform: scale(1.08) rotate(3deg);
  background: rgba(200, 146, 75, 0.1);
}
.feature-card__title {
  font-size: 19px;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 12px;
}
.feature-card__desc {
  font-size: 14px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.48);
}

/* ═══════ 技术链路 ═══════ */
.section--pipeline {
  padding-bottom: 108px;
}
.pipeline-flow { display: grid; grid-template-columns: repeat(4, 1fr); gap: 20px; position: relative; }
.pipeline-step {
  padding: 32px 24px;
}
.pipeline-step__num {
  position: absolute;
  top: 18px;
  right: 20px;
  font-family: var(--font-mono);
  font-size: 15px;
  font-weight: 600;
  color: rgba(200, 146, 75, 0.25);
}
.pipeline-step__icon {
  color: var(--gold);
  margin-bottom: 20px;
}
.pipeline-step__title {
  font-size: 15px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 8px;
}
.pipeline-step__desc {
  font-size: 12.5px;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.45);
}
.pipeline-step__connector {
  position: absolute;
  top: 50%;
  right: -24px;
  transform: translateY(-50%);
  z-index: 2;
  color: rgba(200, 146, 75, 0.4);
}

/* ═══════ 实地验证 ═══════ */
.section--achieve {
  background: linear-gradient(180deg, #050507 0%, #0b0b0f 100%);
  border-top: 1px solid rgba(255, 255, 255, 0.02);
}
.achieve-layout {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr;
  gap: 64px;
  align-items: center;
}
.achieve-desc {
  font-size: 14.5px;
  line-height: 1.8;
  color: rgba(255, 255, 255, 0.45);
  margin-bottom: 16px;
}
.achieve-heading {
  text-align: left;
  line-height: 1.3;
}
.achieve-heading__top {
  display: block;
  font-size: 0.72em;
  font-weight: 500;
  color: var(--gold);
  letter-spacing: 0.02em;
  margin-bottom: 6px;
}
.achieve-heading__bot {
  display: block;
}
.achieve-desc strong {
  color: var(--gold);
}
.achieve-stats {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-top: 36px;
}
.achieve-stat-card {
  border-radius: var(--radius-md);
  padding: 24px;
}
.achieve-stat-card h4 {
  font-size: 24px;
  font-weight: 700;
  color: var(--gold);
  margin-bottom: 4px;
}
.achieve-stat-card p {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.4);
}

.achieve-visual {
  display: flex;
  justify-content: center;
}
.visual-border {
  position: relative;
  background: #09090c;
  border: 1px solid rgba(200, 146, 75, 0.12);
  border-radius: var(--radius-xl);
  padding: 24px;
  overflow: hidden;
  box-shadow: 0 20px 48px rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
}
.visual-img {
  width: 100%;
  max-width: 320px;
  height: auto;
  opacity: 0.75;
}
.visual-scanline {
  position: absolute;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(to right, transparent, var(--ice), transparent);
  box-shadow: 0 0 14px rgba(124, 212, 240, 0.65);
  animation: scanningLine 4s linear infinite;
}
@keyframes scanningLine {
  0% { top: 0%; }
  100% { top: 100%; }
}

/* ═══════ 收尾 CTA ═══════ */
.section--cta {
  background:
    radial-gradient(ellipse 55% 60% at 50% 60%, rgba(200,146,75,0.08) 0%, transparent 65%),
    linear-gradient(180deg, #0b0b0f 0%, #050507 100%);
  padding: 140px 24px 150px;
  border-top: 1px solid rgba(255, 255, 255, 0.03);
}
.cta__inner {
  text-align: center;
}
.cta__title {
  font-family: 'Noto Serif SC', 'STKaiti', 'KaiTi', serif;
  font-size: clamp(36px, 6vw, 64px);
  font-weight: 900;
  line-height: 1.3;
  letter-spacing: 0.03em;
  background: linear-gradient(160deg, #f5e3c0 0%, #e8c878 45%, #C8924B 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  margin-bottom: 24px;
  filter: drop-shadow(0 6px 32px rgba(200, 146, 75, 0.16));
}
.cta__sub {
  font-size: 15px;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 40px;
}
.btn--lg {
  padding: 16px 36px;
  font-size: 15px;
  border-radius: 28px;
}

/* ═══════ 响应式 ═══════ */
@media (max-width: 960px) {
  .pipeline-flow {
    grid-template-columns: repeat(2, 1fr);
    gap: 32px 20px;
  }
  .pipeline-step__connector {
    display: none;
  }
  .achieve-layout {
    grid-template-columns: 1fr;
    gap: 40px;
  }
}

@media (max-width: 640px) {
  .hero__title { font-size: clamp(40px, 14vw, 56px); }
  .hero__tagline { font-size: 14px; letter-spacing: 0.16em; padding-left: 0.16em; }
  .hero__interactive-hint { display: none; }
  .chapter { height: 160dvh; }
  .chapter__sub { white-space: normal; max-width: 90vw; }
  .features-grid { grid-template-columns: 1fr; }
  .feature-card { padding: 32px 26px; }
  .strip__inner { grid-template-columns: repeat(2, 1fr); margin-top: -20px; }
  .strip__item { padding: 20px 14px; }
  .strip__num { font-size: 20px; }
  .pipeline-flow {
    grid-template-columns: 1fr;
  }
}

@media (prefers-reduced-motion: reduce) {
  .chapter { height: auto; }
  .chapter__sticky { position: static; height: auto; padding: 96px 0; }
}
</style>
