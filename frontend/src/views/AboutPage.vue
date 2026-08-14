<template>
  <div class="about">
    <!-- Premium Subpage Hero -->
    <section class="page-hero">
      <div class="page-hero__bg"></div>
      <div class="page-hero__grain"></div>
      <div class="page-hero__inner">
        <span class="page-hero__tag">PROJECT OVERVIEW</span>
        <h1 class="page-hero__title font-premium">项目介绍</h1>
        <p class="page-hero__sub">AI 赋能智慧矿山 — 空地协同地表裂缝三维智能检测</p>
      </div>
    </section>

    <!-- Mission & Mission Visual -->
    <section class="section section--mission reveal">
      <div class="section__inner">
        <div class="mission">
          <div class="mission__text">
            <span class="section__subtitle">OUR MISSION</span>
            <h2 class="section__heading font-premium">穹眸瞰陷 · 守护矿山安全底线</h2>
            <p class="mission-paragraph">
              我国西部及各大矿区地质条件复杂，由于长期煤炭开采引起的**采空区地表沉陷及开裂**是引发地质灾害、威胁矿区人民生命与国家能源生产安全的重要隐患。传统的拉线式人工巡检效率低下、盲区多且危险度高，极难应对恶劣多变的山区与矿场野外环境。
            </p>
            <p class="mission-paragraph">
              <strong>“穹眸瞰陷”实践团</strong>依托先进的**多模态大语言模型（基于豆包大模型）**及无人机智能测绘航拍技术，针对性构建了新一代**非接触式地表裂缝智能检测与安全预警系统**。系统通过无人机网格化超清取证，由云端大模型对图像特征进行深度分析、走向定位、边缘像素分割，并在前台结合航标参数折算物理尺寸，实现地表形变的低成本、自动化监测。
            </p>
            <p class="mission-paragraph">
              2026 年暑期，团队深入**内蒙古鄂尔多斯准格尔旗酸刺沟矿业**实地驻矿实践。面对这一年产 1200 万吨的现代化特大型矿井，我们将科研成果写在祖国广袤的大地上，以科技青年之力量服务于国家能源安全战略。
            </p>
          </div>
          <div class="mission__visual">
            <div class="visual-wrapper">
              <svg viewBox="0 0 400 320" fill="none" xmlns="http://www.w3.org/2000/svg" class="mission-svg">
                <defs>
                  <linearGradient id="gold-grad" x1="0" y1="0" x2="400" y2="320">
                    <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.25"/>
                    <stop offset="100%" stop-color="var(--gold)" stop-opacity="0.02"/>
                  </linearGradient>
                  <radialGradient id="glow-grad" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stop-color="var(--gold)" stop-opacity="0.3"/>
                    <stop offset="100%" stop-color="var(--gold)" stop-opacity="0"/>
                  </radialGradient>
                </defs>
                <!-- Isometric grid representation of earth surface -->
                <ellipse cx="200" cy="220" rx="160" ry="60" fill="url(#gold-grad)" stroke="rgba(200, 146, 75, 0.2)" stroke-width="1.2"/>
                <ellipse cx="200" cy="220" rx="120" ry="45" fill="none" stroke="rgba(200, 146, 75, 0.15)" stroke-width="1" stroke-dasharray="4 4"/>
                
                <!-- Glowing scanner source at top (UAV camera lens) -->
                <circle cx="200" cy="70" r="40" fill="url(#glow-grad)"/>
                <circle cx="200" cy="70" r="4" fill="var(--gold)" />
                <circle cx="200" cy="70" r="12" fill="none" stroke="var(--gold)" stroke-width="1" class="scanner-pulse"/>

                <!-- Laser scanning rays downward to ground faults -->
                <line x1="200" y1="70" x2="130" y2="200" stroke="rgba(200,146,75,0.4)" stroke-width="1" stroke-dasharray="2 2" />
                <line x1="200" y1="70" x2="270" y2="215" stroke="rgba(200,146,75,0.4)" stroke-width="1" stroke-dasharray="2 2" />
                <line x1="200" y1="70" x2="200" y2="240" stroke="var(--gold)" stroke-width="1.2" />

                <!-- Earth crack lines drawn in gold -->
                <path d="M120 200 L160 210 L180 230 L210 225 L240 245 L280 235" stroke="var(--gold)" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" class="draw-line-anim"/>
                <path d="M160 210 L150 225 L135 230" stroke="rgba(200,146,75,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>
                <path d="M210 225 L225 210 L245 205" stroke="rgba(200,146,75,0.5)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"/>

                <!-- Target box indicator overlay -->
                <rect x="155" y="195" width="90" height="55" rx="4" stroke="#ff3b30" stroke-width="1" stroke-dasharray="4 2" fill="none" opacity="0.6"/>
                <text x="160" y="190" fill="#ff3b30" font-size="9" font-family="monospace" opacity="0.8">FAULT_DETECTED [96%]</text>
              </svg>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Workflow (Technical Path) -->
    <section class="section section--dark reveal">
      <div class="section__inner">
        <span class="section__subtitle">SYSTEM WORKFLOW</span>
        <h2 class="section__heading section__heading--center font-premium">智能检测四大工艺阶段</h2>
        <p class="workflow-summary">从无人机野外航采到云端算法渲染，四步构成地表危害全自动监控闭环，确保矿区人员对地表塌陷危险的秒级感知与精准处理。</p>
        
        <div class="workflow">
          <div class="workflow__step lg-card lg-glass--sheen" v-for="(s, i) in workflow" :key="i">
            <div class="workflow__icon-wrap">
              <div class="workflow__icon" v-html="s.icon"></div>
            </div>
            <h3 class="workflow__title">{{ s.title }}</h3>
            <p class="workflow__desc">{{ s.desc }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Background (Practice Context) -->
    <section class="section reveal">
      <div class="section__inner">
        <span class="section__subtitle">PRACTICE CONTEXT</span>
        <h2 class="section__heading section__heading--center font-premium">实践立项背景</h2>
        
        <div class="context-list">
          <div class="context-row" v-for="(c, i) in contexts" :key="i">
            <div class="context-row__idx-wrap">
              <span class="context-row__idx">{{ String(i + 1).padStart(2, '0') }}</span>
              <div class="idx-glow"></div>
            </div>
            <div class="context-row__body">
              <h3 class="context-row__title">{{ c.title }}</h3>
              <p class="context-row__text">{{ c.text }}</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Timeline -->
    <section class="section section--dark reveal">
      <div class="section__inner">
        <span class="section__subtitle">PRACTICE TIMELINE</span>
        <h2 class="section__heading section__heading--center font-premium">鄂尔多斯酸刺沟驻矿行程</h2>
        
        <ScrollSnap class="timeline" :gap="20">
          <div class="timeline__item lg-card lg-glass--sheen" v-for="(t, i) in timeline" :key="i">
            <div class="timeline__top">
              <span class="timeline__step">{{ String(i + 1).padStart(2, '0') }}</span>
              <span class="timeline__date">{{ t.date }}</span>
            </div>
            <h4 class="timeline__title">{{ t.title }}</h4>
            <p class="timeline__desc">{{ t.desc }}</p>
          </div>
        </ScrollSnap>
      </div>
    </section>
  </div>
</template>

<script setup>
import ScrollSnap from '../components/ScrollSnap.vue'

const workflow = [
  { 
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>', 
    title: "无人机超清航拍", 
    desc: "规划自主网格化飞行航线，搭载高清光学传感器，对地表沉陷受损区域进行多角度密集摄影取证。" 
  },
  { 
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>', 
    title: "AI 多模态大模型分割", 
    desc: "将航拍数据传输至云端，基于先进大语言模型多模态能力与目标分割架构，实时提取出地裂缝的边界框与边缘关键点。" 
  },
  { 
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>', 
    title: "高精度定标标注", 
    desc: "结合镜头地面分辨率(GSD)与无人机飞行相对高度，自动结算出每一条地裂缝的真实物理宽度、走向、长度及面积。" 
  },
  { 
    icon: '<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>', 
    title: "灾害等级预警报告", 
    desc: "自动根据裂隙最大宽度计算安全指数，判定危险分级，提供工程加固排险建议，并支持一键导出精美打印报告。" 
  },
]

const contexts = [
  { 
    title: "国家战略 - 智能矿山安全发展大趋势", 
    text: "国家发改委、能源局等十五部委联合下发《关于加快煤矿智能化发展的指导意见》，明确指出利用人工智能、无人机航测、三维地理空间底座等技术，与煤矿安全灾害防控深度融合，全面提升灾害非接触监测预警水平。" 
  },
  { 
    title: "技术革新 - 大模型多模态感知能力成熟", 
    text: "以大语言模型为基座的计算机视觉、多模态智能体算法发展迅猛。相比传统单一依靠经典阈值算子的图像特征提取，多模态大模型对自然地质环境干扰（阴影、植被、光照变化）具有极强的抗噪力，几何识别精度高达厘米级。" 
  },
  { 
    title: "青年担当 - 学以致用服务矿区能源建设", 
    text: "作为中国矿业大学（北京）采矿工程双一流学科学生，我们践行“明德至善，好学力行”的校训，主动走向鄂尔多斯特大型煤矿生产一线，将实验室的AI大模型与三维测绘成果投入现场验证，用汗水筑牢我国矿区安全红线。" 
  },
]

const timeline = [
  { 
    date: "7月14日 – 7月15日", 
    title: "集结整装 & 奔赴矿区一线", 
    desc: "实践团由北京出发，穿越晋蒙，顺利抵达酸刺沟特大型煤矿。与矿区机电安监科室对接，听取总工程师介绍采空区地表塌陷灾害特点，明确系统部署目标。" 
  },
  { 
    date: "7月16日 – 7月25日", 
    title: "现场联合测绘 & 图像样本采集", 
    desc: "深入野外露头采动沉陷区，操控网格飞行无人机采集大量干缩裂缝、裂缝群超清影像，并对航高、相机焦距等像元参比进行定标标定。" 
  },
  { 
    date: "7月26日 – 7月28日", 
    title: "AI 识别联调 & 算法可靠性验证", 
    desc: "将采集的真实航拍图输入智能检测前台系统，同火山引擎接口连通测试，对识别输出的裂隙轮廓与外框进行手动量测比对，修正畸变标定常数。" 
  },
  { 
    date: "7月29日 – 8月31日", 
    title: "软件成果封包 & 报告总结编制", 
    desc: "进行前端模块合并与极简高科技UI重塑，打包本地检测历史记录及PDF报告功能。汇总实地测算成果，撰写多万字地质实践报告，向能源学院及矿场进行成果汇报。" 
  },
]
</script>

<style scoped>
/* Page Hero Redesign */
.page-hero {
  position: relative;
  padding: 140px 24px 72px;
  background: var(--black);
  text-align: center;
  overflow: hidden;
}
.page-hero__bg {
  position: absolute;
  inset: 0;
  background: radial-gradient(ellipse 60% 50% at 50% 10%, rgba(200,146,75,0.08) 0%, transparent 60%),
              linear-gradient(180deg, #070708 0%, #101014 100%);
}
.page-hero__grain {
  position: absolute;
  inset: 0;
  pointer-events: none;
  background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)' opacity='0.04'/%3E%3C/svg%3E");
  background-size: 200px 200px;
  opacity: 0.4;
}
.page-hero__inner {
  position: relative;
  z-index: 2;
  max-width: 800px;
  margin: 0 auto;
}
.page-hero__tag {
  display: inline-block;
  font-size: 11px;
  font-weight: 600;
  letter-spacing: 0.2em;
  color: var(--gold);
  margin-bottom: 12px;
  text-transform: uppercase;
}
.page-hero__title {
  font-size: clamp(44px, 7vw, 68px);
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
  animation: fadeUp 0.8s cubic-bezier(0.16,1,0.3,1);
}
.page-hero__sub {
  font-size: 15.5px;
  color: var(--gray-400);
  font-weight: 400;
  letter-spacing: 0.02em;
  animation: fadeUp 0.8s 0.12s both cubic-bezier(0.16,1,0.3,1);
}

/* Mission section */
.section--mission {
  background: transparent;
}
.mission { 
  display: grid; 
  grid-template-columns: 1.12fr 0.88fr; 
  gap: 64px; 
  align-items: center; 
}
.mission-paragraph { 
  font-size: 14.5px; 
  line-height: 1.82; 
  color: rgba(255, 255, 255, 0.75); 
  margin-bottom: 18px; 
}
.mission-paragraph strong { 
  color: #fff; 
  font-weight: 600; 
}
.mission__visual { 
  display: flex; 
  justify-content: center; 
}
.visual-wrapper {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: 16px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
}
.mission-svg { 
  width: 100%; 
  max-width: 380px; 
  height: auto; 
}
.scanner-pulse {
  animation: scanPulse 2s infinite ease-out;
  transform-origin: 200px 70px;
}
@keyframes scanPulse {
  0% { transform: scale(0.6); opacity: 1; }
  100% { transform: scale(2.2); opacity: 0; }
}
.draw-line-anim {
  stroke-dasharray: 500;
  stroke-dashoffset: 500;
  animation: drawLine 3.5s forwards cubic-bezier(0.4, 0, 0.2, 1) infinite;
}
@keyframes drawLine {
  0% { stroke-dashoffset: 500; }
  70%, 100% { stroke-dashoffset: 0; }
}

/* Workflow step cards redesign */
.workflow-summary {
  max-width: 720px;
  margin: -24px auto 56px;
  text-align: center;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.45);
}
.workflow { 
  display: grid; 
  grid-template-columns: repeat(4, 1fr); 
  gap: 20px; 
}
.workflow__step { 
  text-align: center; 
  padding: 40px 24px 32px; 
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border-radius: var(--radius-lg); 
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
  transition: all 0.35s cubic-bezier(0.25, 0.8, 0.25, 1); 
}
.workflow__step:hover { 
  background: rgba(255,255,255,0.04); 
  transform: translateY(-6px) scale(1.02); 
  border-color: rgba(200,146,75,0.3); 
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.2), 
    0 24px 48px rgba(0, 0, 0, 0.6);
}
.workflow__icon-wrap {
  width: 56px;
  height: 56px;
  border-radius: 14px;
  background: rgba(200, 146, 75, 0.08);
  border: 1px solid rgba(200, 146, 75, 0.12);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 24px;
  transition: transform 0.35s;
}
.workflow__step:hover .workflow__icon-wrap {
  transform: scale(1.1) rotate(4deg);
  background: rgba(200, 146, 75, 0.14);
}
.workflow__icon { color: var(--gold); display: flex; justify-content: center; }
.workflow__title { font-size: 15.5px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.workflow__desc { font-size: 12px; line-height: 1.6; color: rgba(255,255,255,0.4); }

/* Context background list */
.context-list { 
  display: flex; 
  flex-direction: column; 
  gap: 16px; 
}
.context-row { 
  display: flex; 
  gap: 28px; 
  align-items: flex-start; 
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  padding: 32px; 
  border-radius: var(--radius-xl);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
  transition: all 0.4s ease; 
}
.context-row:hover { 
  border-color: rgba(200, 146, 75, 0.3);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.2), 
    0 24px 48px rgba(0, 0, 0, 0.6);
  transform: translateX(4px);
}
.context-row__idx-wrap {
  position: relative;
  flex-shrink: 0; 
  width: 44px;
  height: 44px;
  background: var(--black);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
.context-row__idx { 
  font-size: 15px; 
  font-weight: 700; 
  color: var(--gold); 
  font-family: var(--font-mono); 
  z-index: 2;
}
.idx-glow {
  position: absolute;
  inset: 0;
  border-radius: 12px;
  box-shadow: 0 0 10px rgba(200, 146, 75, 0.4);
  opacity: 0;
  transition: opacity 0.3s;
}
.context-row:hover .idx-glow {
  opacity: 1;
}
.context-row__body {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.context-row__title { font-size: 17px; font-weight: 700; color: #fff; }
.context-row__text { font-size: 13.5px; line-height: 1.7; color: rgba(255, 255, 255, 0.7); }

/* Timeline → Apple 式圆角矩形横滑卡片 */
.timeline__item {
  flex: 0 0 min(320px, 82vw);
  scroll-snap-align: start;
  border-radius: 20px;
  padding: 28px 26px;
}
.timeline__top {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 18px;
}
.timeline__step {
  font-family: var(--font-mono);
  font-size: 13px;
  font-weight: 600;
  color: var(--ice);
  letter-spacing: 0.08em;
  padding: 4px 10px;
  border: 1px solid var(--ice-border);
  border-radius: 999px;
  background: var(--ice-dim);
}
.timeline__date { font-size: 11px; color: var(--gold); font-weight: 700; letter-spacing: 0.05em; font-family: var(--font-mono); }
.timeline__title { font-size: 17px; font-weight: 700; color: #fff; margin-bottom: 10px; }
.timeline__desc { font-size: 13px; line-height: 1.7; color: rgba(255,255,255,0.55); }

@media (max-width: 768px) {
  .mission { grid-template-columns: 1fr; gap: 40px; }
  .workflow { grid-template-columns: repeat(2, 1fr); }
  .context-row { padding: 24px; gap: 18px; }
}
@media (max-width: 480px) {
  .workflow { grid-template-columns: 1fr; }
}
</style>
