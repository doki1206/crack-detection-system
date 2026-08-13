<template>
  <div class="team">
    <!-- Premium Subpage Hero -->
    <section class="page-hero">
      <div class="page-hero__bg"></div>
      <div class="page-hero__grain"></div>
      <div class="page-hero__inner">
        <span class="page-hero__tag">TEAM MEMBERS</span>
        <h1 class="page-hero__title font-premium">团队介绍</h1>
        <p class="page-hero__sub">中国矿业大学（北京）能源与矿业学院 &middot; 赴内蒙古鄂尔多斯“穹眸瞰陷”实践团</p>
      </div>
    </section>

    <!-- Mentor Advisor Section -->
    <section class="section section--advisor reveal">
      <div class="section__inner">
        <span class="section__subtitle">GUIDING ADVISOR</span>
        <h2 class="section__heading section__heading--center font-premium">指导老师</h2>
        
        <div class="advisors-grid">
          <div class="advisor-card" v-for="a in advisors" :key="a.name">
            <div class="advisor-card__visual">
              <div class="avatar-ring animate-rotate"></div>
              <div class="avatar-glow"></div>
              <div class="advisor-avatar">
                <!-- Kaiti font character vector style -->
                <svg viewBox="0 0 100 100" width="100" height="100">
                  <circle cx="50" cy="50" r="46" fill="#0b0b0d" stroke="var(--gold)" stroke-width="1.5"/>
                  <circle cx="50" cy="50" r="41" fill="none" stroke="rgba(200, 146, 75, 0.25)" stroke-width="1" stroke-dasharray="6 3"/>
                  <text x="50" y="59" fill="var(--gold)" font-size="28" font-family="'STKaiti','KaiTi','SimSun',serif" font-weight="bold" text-anchor="middle">{{ a.name.slice(0, 1) }}</text>
                </svg>
              </div>
            </div>
            <div class="advisor-card__info">
              <div class="advisor-head">
                <h3>{{ a.name }}</h3>
                <span class="advisor-title">{{ a.title }}</span>
              </div>
              <p class="advisor-org">{{ a.org }}</p>
              <div class="tags-container">
                <span class="tag-chip" v-for="(tag, idx) in a.tags" :key="idx">{{ tag }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- Student Members Section -->
    <section class="section section--members reveal">
      <div class="section__inner">
        <span class="section__subtitle">PRACTICE MEMBERS</span>
        <h2 class="section__heading section__heading--center font-premium">成员风采</h2>
        <p class="members-summary">实践团队覆盖矿业工程、AI技术应用、数码建模、视频记录及联络公关，形成了优势互补、高效协同的一体化团队结构。</p>
        
        <div class="members-grid">
          <div class="member-card" v-for="m in members" :key="m.name">
            <div class="member-card__visual">
              <div class="member-avatar">
                <!-- Specialized SVG geometric digital avatar -->
                <svg viewBox="0 0 80 80" width="72" height="72" class="member-avatar-svg">
                  <circle cx="40" cy="40" r="36" fill="#0f0f12" stroke="rgba(200, 146, 75, 0.4)" stroke-width="1"/>
                  <circle cx="40" cy="40" r="32" fill="none" stroke="rgba(200, 146, 75, 0.15)" stroke-width="0.8" stroke-dasharray="4 2"/>
                  <!-- Core text -->
                  <text x="40" y="47" fill="var(--gold)" font-size="16" font-family="'STKaiti','KaiTi',serif" font-weight="bold" text-anchor="middle">
                    {{ m.name.slice(-2) }}
                  </text>
                  <!-- Decorative polygonal tech graphics -->
                  <path d="M40 8 L44 14 L36 14 Z M40 72 L44 66 L36 66 Z" fill="rgba(200, 146, 75, 0.35)"/>
                </svg>
              </div>
              <div class="role-badge">{{ m.role }}</div>
            </div>
            
            <h3 class="member-name">{{ m.name }}</h3>
            
            <div class="member-details">
              <div class="detail-block">
                <span class="detail-label">个人特长</span>
                <p class="detail-text">{{ m.talent }}</p>
              </div>
              <div class="detail-block">
                <span class="detail-label">工作宣言 / 自评</span>
                <p class="detail-text eval-quote">“{{ m.eval }}”</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const advisors = [
  {
    name: "赵毅鑫",
    title: "教授 · 博士生导师",
    org: "中国矿业大学（北京）科学技术研究院院长",
    tags: [
      "国家杰出青年科学基金获得者",
      "教育部“新世纪优秀人才”",
      "北京市科技新星",
      "国际岩石力学学会(ISRM)专委会主席",
      "孙越崎青年科技奖获得者",
      "长期从事采矿岩石力学及工程应用研究"
    ]
  },
  {
    name: "滕腾",
    title: "副教授 · 博士生导师",
    org: "中国矿业大学（北京）能源与矿业学院",
    tags: [
      "国家重点研发计划项目 3 项",
      "中国科协青年人才托举工程（2019）",
      "中国岩石力学与工程学会吸附性岩石力学与工程专委会秘书长",
      "主持国家自然科学基金项目/课题 2 项",
      "国内外发明专利 20 项 & 软件著作权 3 项",
      "省部级科技进步奖 6 项",
      "发表 SCI/EI 学术论文 50 余篇",
      "出版矿业专著 1 部",
    ]
  }
]

const members = [
  { name: "陈继涵", role: "队长", talent: "组织协调、团队宣传，具有丰富文体社团及校艺术团活动组织经验。", eval: "永远乐于尝试新事物，善于团队沟通与统筹协调。" },
  { name: "胡昕晔", role: "副队长", talent: "AI智能体开发、产品交互设计、团队策划，曾获“京彩大创”市级二等奖。", eval: "底层思维扎实，兼具工程实践动手能力与卓越的产品视觉审美。" },
  { name: "陈佳波", role: "记录员", talent: "文案报告撰写、逻辑辩论，入党积极分子，班级骨干。", eval: "对地质充满敬畏与好奇，希望做一个真诚、勇敢、有担当的矿业学子。" },
  { name: "陈恒生", role: "记录员", talent: "CAD测绘、3D地貌建模与数字化创意设计。", eval: "乐于钻研，不知疲倦，善于用数字化手段创造与创新。" },
  { name: "庄涵寓", role: "采集专员", talent: "网络影像纪实、无人机数据采集与航拍视频后期剪辑。", eval: "踏实坚韧，不因实验失败而气馁，执行力强。" },
  { name: "李嘉明", role: "采集专员", talent: "球类运动、地表裂缝雷达测量，能源学院辩论队核心辩手。", eval: "乐于探索自然未知，善于工程沟通交流与理性分析。" },
  { name: "朱涵宇", role: "联络专员", talent: "现场地质摄影、逻辑数据归档、班级团支部统筹协调工作。", eval: "做事认真严谨，思维缜密，善于在团队联络中发挥枢纽作用。" },
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
  font-size: clamp(38px, 6vw, 56px);
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.02em;
  margin-bottom: 14px;
}
.page-hero__sub {
  font-size: 15.5px;
  color: var(--gray-400);
  font-weight: 400;
  letter-spacing: 0.02em;
}

/* Advisor Card Section */
.section--advisor {
  background: transparent;
  padding-bottom: 56px;
}
.advisors-grid {
  display: flex;
  flex-direction: column;
  gap: 32px;
  max-width: 860px;
  margin: 0 auto;
}
.advisor-card {
  display: flex;
  align-items: center;
  gap: 40px;
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: 40px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
}
@media (max-width: 768px) {
  .advisor-card { flex-direction: column; text-align: center; gap: 28px; padding: 32px 20px; }
}
.advisor-card__visual { position: relative; width: 140px; height: 140px; flex-shrink: 0; }
.avatar-ring {
  position: absolute;
  inset: -12px;
  border-radius: 50%;
  border: 1px dashed rgba(200, 146, 75, 0.3);
  animation: spin 16s linear infinite;
}
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}
.avatar-glow {
  position: absolute;
  inset: 0;
  border-radius: 50%;
  background: radial-gradient(circle at 50% 50%, rgba(200, 146, 75, 0.15), transparent 70%);
}
.advisor-avatar {
  position: relative;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: #0f0f12;
  border: 2px solid rgba(200, 146, 75, 0.5);
  display: flex; align-items: center; justify-content: center;
  overflow: hidden;
}
.advisor-head h3 { font-size: 28px; font-weight: 700; color: #fff; margin-bottom: 6px; }
.advisor-title { font-size: 14px; font-weight: 500; color: var(--gold); letter-spacing: 0.05em; }
.advisor-org { font-size: 14px; color: rgba(255,255,255,0.6); margin: 12px 0 20px; }

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px 8px;
}
.tag-chip {
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  font-size: 11.5px;
  padding: 6px 14px;
  border-radius: var(--radius-sm);
  transition: all 0.25s;
}
.tag-chip:hover {
  background: rgba(200, 146, 75, 0.15);
  border-color: rgba(200, 146, 75, 0.4);
  color: var(--gold);
}

/* Student Members Grid */
.section--members {
  background: transparent;
}
.members-summary {
  max-width: 720px;
  margin: -24px auto 52px;
  text-align: center;
  font-size: 14px;
  line-height: 1.75;
  color: rgba(255, 255, 255, 0.6);
}
.members-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 28px;
}
.member-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: 36px 28px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
  transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
}
.member-card:hover {
  transform: translateY(-6px) scale(1.02);
  background: rgba(255, 255, 255, 0.04);
  border-color: rgba(200, 146, 75, 0.3);
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.2), 
    0 24px 48px rgba(0, 0, 0, 0.6);
}

.member-card__visual {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
}
.member-avatar {
  background: #111;
  border-radius: 50%;
  width: 72px;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
  transition: transform 0.35s;
}
.member-card:hover .member-avatar {
  transform: scale(1.06);
}
.member-avatar-svg {
  display: block;
}
.role-badge {
  background: var(--gold-dim);
  border: 1px solid rgba(200, 146, 75, 0.2);
  color: var(--gold-dark);
  font-size: 10.5px;
  font-weight: 700;
  padding: 4px 12px;
  border-radius: 12px;
  letter-spacing: 0.05em;
}

.member-name {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  margin-bottom: 20px;
  letter-spacing: -0.01em;
}

.member-details {
  display: flex;
  flex-direction: column;
  gap: 16px;
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 18px;
}
.detail-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.detail-label {
  font-size: 9.5px;
  text-transform: uppercase;
  color: var(--gold);
  font-weight: 600;
  letter-spacing: 0.05em;
}
.detail-text {
  font-size: 12.5px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.7);
}
.eval-quote {
  font-style: italic;
  color: rgba(255, 255, 255, 0.85);
  background: rgba(255, 255, 255, 0.03);
  padding: 12px 16px;
  border-left: 2px solid var(--gold);
  border-radius: 0 8px 8px 0;
}

@media (max-width: 768px) {
  .advisor-card {
    grid-template-columns: 1fr;
    gap: 28px;
    padding: 32px 24px;
    text-align: center;
  }
  .advisor-head {
    justify-content: center;
  }
  .tags-container {
    justify-content: center;
  }
}
</style>
