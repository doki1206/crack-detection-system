<template>
  <div class="detect">
    <section class="page-hero">
      <div class="page-hero__inner">
        <h1 class="page-hero__title font-premium">AI 智能地表裂缝检测</h1>
        <p class="page-hero__sub">上传无人机巡检图像，进行厘米级缺陷分割与物理定标分析</p>
        <button class="btn btn--ghost btn--sm metrics-btn" @click="showMetrics = true">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M3 17L17 3l4 4L7 21H3v-4z"/><path d="M8 16l1.5-1.5M11 13l1.5-1.5M14 10l1.5-1.5"/></svg>
          测量内容
        </button>
      </div>
    </section>

    <section class="section">
      <div class="section__inner">
        <div class="layout">
          <!-- Left Panel: Upload and Calibration -->
          <div class="left-panel">
            <div class="upload-panel" :class="{ 'upload-panel--loaded': imageSrc }">
              <!-- Empty Upload Zone -->
              <div v-if="!imageSrc" class="dropzone" @click="triggerUpload" @dragover.prevent @drop.prevent="handleDrop">
                <div class="dropzone__visual">
                  <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.2" class="uav-pulse">
                    <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/>
                    <polyline points="17 8 12 3 7 8"/>
                    <line x1="12" y1="3" x2="12" y2="15"/>
                  </svg>
                </div>
                <p class="dropzone__text">点击上传或拖拽无人机航拍图片到此处</p>
                <p class="dropzone__hint">支持 JPG、PNG、WebP 高清图像</p>
                <input ref="fileInput" type="file" accept="image/*" @change="handleFile" hidden />

                <!-- Preset Gallery for One-click Testing -->
                <div class="preset-gallery" @click.stop>
                  <p class="preset-title">点击示例图片快速测试</p>
                  <div class="presets">
                    <div 
                      v-for="(p, idx) in presets" 
                      :key="idx" 
                      class="preset-item" 
                      @click="loadPreset(p.url, p.name)"
                    >
                      <div class="preset-thumb" :style="{ backgroundImage: `url(${p.url})` }"></div>
                      <span class="preset-label">{{ p.name }}</span>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Image Preview Zone -->
              <div v-else class="preview">
                <div class="preview__wrap" ref="imageWrap">
                  <img :src="imageSrc" class="preview__img" ref="previewImg" @load="onImageLoad" />
                  
                  <!-- Tech Scanning Overlay -->
                  <div v-if="detecting" class="scanning-overlay">
                    <div class="scanning-line"></div>
                    <div class="scanning-grid"></div>
                  </div>

                  <!-- Canvas Overlay -->
                  <canvas 
                    ref="bboxCanvas" 
                    class="preview__canvas" 
                    @mousemove="handleCanvasMouseMove"
                    @mouseleave="handleCanvasMouseLeave"
                  ></canvas>

                  <!-- Dynamic Tooltip -->
                  <div 
                    v-if="tooltip.visible" 
                    class="canvas-tooltip" 
                    :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
                  >
                    <div class="tooltip-title">{{ tooltip.type }}</div>
                    <div class="tooltip-row"><span>置信度:</span> <strong>{{ tooltip.conf }}%</strong></div>
                    <div v-if="tooltip.metrics.width" class="tooltip-row">
                      <span>最大宽度:</span> <strong>{{ tooltip.metrics.width }}</strong>
                    </div>
                    <div v-if="tooltip.metrics.length" class="tooltip-row">
                      <span>几何长度:</span> <strong>{{ tooltip.metrics.length }}</strong>
                    </div>
                    <div v-if="tooltip.metrics.orientation" class="tooltip-row">
                      <span>走向:</span> <strong>{{ tooltip.metrics.orientation }}</strong>
                    </div>
                    <div v-if="tooltip.metrics.crack_density" class="tooltip-row">
                      <span>裂纹密度:</span> <strong>{{ tooltip.metrics.crack_density }}</strong>
                    </div>
                    <div v-if="tooltip.metrics.attitude" class="tooltip-row">
                      <span>产状:</span> <strong>{{ tooltip.metrics.attitude }}</strong>
                    </div>
                    <div v-if="tooltip.metrics.connectivity" class="tooltip-row">
                      <span>联通性:</span> <strong>{{ tooltip.metrics.connectivity }}</strong>
                    </div>
                    <div v-if="tooltip.metrics.fractal_dimension" class="tooltip-row">
                      <span>分形维数:</span> <strong>{{ tooltip.metrics.fractal_dimension }}</strong>
                    </div>
                  </div>
                </div>

                <div class="preview__bar">
                  <button class="btn btn--outline btn--sm" @click="clearImage" :disabled="detecting">更换图片</button>
                  
                  <!-- Calibration Toggle -->
                  <button 
                    class="btn btn--ghost btn--sm" 
                    :class="{ 'btn--active': showCalibrator }"
                    @click="showCalibrator = !showCalibrator"
                    :disabled="detecting"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z"/><line x1="4" y1="22" x2="4" y2="15"/></svg>
                    物理单位校准
                  </button>

                  <button class="btn btn--gold btn--sm" @click="runDetection" :disabled="detecting || !imageSrc || !imageFile">
                    <svg v-if="detecting" class="spin" width="14" height="14" viewBox="0 0 24 24" fill="none">
                      <circle cx="12" cy="12" r="10" stroke="currentColor" stroke-width="2" opacity="0.2"/>
                      <path d="M12 2a10 10 0 019.95 9" stroke="currentColor" stroke-width="2" stroke-linecap="round"/>
                    </svg>
                    <span v-else>开始智能分析</span>
                  </button>
                </div>
              </div>
            </div>

            <!-- Calibration Panel -->
            <transition name="slide">
              <div v-if="showCalibrator && imageSrc" class="calibrator-card">
                <div class="card-header">
                  <h3>航拍物理参数标定</h3>
                  <span class="badge">厘米级换算</span>
                </div>
                <p class="calibrator-desc">输入无人机航拍参数，自动将裂缝像素值（px）换算为地表真实物理尺寸（m/cm）。</p>
                <div class="form-grid">
                  <div class="form-group">
                    <label>飞行高度 (H)</label>
                    <div class="input-wrap">
                      <input type="number" v-model.number="calibration.height" min="10" max="300" />
                      <span class="unit">米 (m)</span>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>相机镜头型号 (GSD标定)</label>
                    <select v-model="calibration.camera">
                      <option value="zenmuse-h20t">DJI H20T 行业红外镜头</option>
                      <option value="ma3e">DJI Mavic 3E 航测镜头</option>
                      <option value="custom">手动输入每像素比例</option>
                    </select>
                  </div>
                  <div v-if="calibration.camera === 'custom'" class="form-group">
                    <label>自定义像元地面分辨率 (GSD)</label>
                    <div class="input-wrap">
                      <input type="number" v-model.number="calibration.gsd" step="0.01" />
                      <span class="unit">cm / 像素</span>
                    </div>
                  </div>
                </div>
                <div class="calibration-output">
                  <span>当前计算地面采样率 (GSD): </span>
                  <strong>{{ currentGSD.toFixed(3) }} cm / 像素</strong>
                </div>
              </div>
            </transition>

            <!-- History list -->
            <div v-if="history.length > 0 && !imageSrc" class="history-card">
              <h3>最近检测历史</h3>
              <div class="history-list">
                <div 
                  v-for="item in history" 
                  :key="item.id" 
                  class="history-item"
                  @click="loadHistory(item)"
                >
                  <div class="history-thumb" :style="{ backgroundImage: `url(${item.thumbnail})` }"></div>
                  <div class="history-info">
                    <div class="history-name">{{ item.name }}</div>
                    <div class="history-meta">
                      <span>{{ item.time }}</span>
                      <span class="count">{{ item.cracksCount }} 处裂缝</span>
                    </div>
                  </div>
                  <div class="history-arrow">&rarr;</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Panel: Results Dashboard -->
          <div class="right-panel">
            <div class="results-panel" :class="{ 'results-panel--empty': !result && !detecting }">
              <!-- Empty State -->
              <div v-if="!result && !detecting" class="results-empty">
                <div class="empty-icon-wrap">
                  <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1" opacity="0.35">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/>
                  </svg>
                </div>
                <p>等待上传图像进行分析<br />系统将提供多维度几何走向分析报表</p>
              </div>

              <!-- Loading State with Step logs -->
              <div v-if="detecting" class="results-loading">
                <div class="dots-glow">
                  <div class="dots"><span></span><span></span><span></span></div>
                </div>
                <h4 class="loading-title">AI 大模型分析中</h4>
                <div class="log-stream">
                  <div 
                    v-for="(log, idx) in loadingLogs" 
                    :key="idx" 
                    class="log-item"
                    :class="{ 'log-item--done': idx < activeLogIndex, 'log-item--active': idx === activeLogIndex }"
                  >
                    <span class="log-dot"></span>
                    <span class="log-text">{{ log }}</span>
                  </div>
                </div>
              </div>

              <!-- Error State -->
              <div v-if="detectError && !detecting" class="results-error">
                <div class="error-card">
                  <div class="error-card__icon">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f87171" stroke-width="2">
                      <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
                    </svg>
                  </div>
                  <p class="error-card__msg">{{ detectError }}</p>
                  <button class="error-card__retry" @click="runDetection">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 11-2.12-9.36L23 10"/></svg>
                    重新检测
                  </button>
                </div>
              </div>

              <!-- Result Dashboard View -->
              <div v-if="result && !detecting && !detectError" class="results-body">
                <!-- Safety Score Header Dashboard -->
                <div class="safety-dashboard">
                  <div class="safety-score-wrap">
                    <div class="safety-dial" :class="safetyClass">
                      <span class="score-num">{{ safetyScore }}</span>
                      <span class="score-label">安全评分</span>
                    </div>
                  </div>
                  <div class="safety-meta">
                    <div class="meta-row">
                      <span>安全评级:</span>
                      <strong :class="safetyClass">{{ safetyRating }}</strong>
                    </div>
                    <div class="meta-row">
                      <span>裂缝总数:</span>
                      <strong>{{ result.cracks?.length || 0 }} 处</strong>
                    </div>
                    <div v-if="hasMetrics" class="meta-row">
                      <span>最大裂隙宽度:</span>
                      <strong>{{ formatWidth(maxWidthPx) }}</strong>
                    </div>
                  </div>
                </div>

                <div class="results-summary">
                  <h4>地貌识别总结</h4>
                  <p>{{ result.summary || '未检测到裂缝痕迹，地貌状态正常。' }}</p>
                </div>

                <!-- Cracks detailed list -->
                <div v-if="result.cracks && result.cracks.length > 0" class="cracks-section">
                  <div class="section-header">
                    <h4>裂纹形变明细清单</h4>
                    <button class="btn btn--outline btn--xs" @click="exportToPdf">
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
                      导出评估报告
                    </button>
                  </div>
                  <div class="cracks-list">
                    <div 
                      class="crack-card" 
                      v-for="(c, i) in result.cracks" 
                      :key="i"
                      @mouseenter="setHoveredIndex(i)"
                      @mouseleave="setHoveredIndex(null)"
                      :class="{ 'crack-card--hovered': hoveredIndex === i }"
                    >
                      <div class="crack-card__head">
                        <div class="crack-card__title">
                          <span class="idx-badge">{{ i + 1 }}</span>
                          <span class="type-name">{{ c.type || '沉陷裂缝' }}</span>
                        </div>
                        <span class="conf-badge">{{ Math.round((c.confidence || 0) * 100) }}% 置信</span>
                      </div>
                      
                      <div class="metrics-grid">
                        <div class="metric-item">
                          <span class="label">最大宽度</span>
                          <strong class="val">{{ formatWidth(c.metrics?.max_width_px) }}</strong>
                        </div>
                        <div class="metric-item">
                          <span class="label">几何长度</span>
                          <strong class="val">{{ formatLength(c.metrics?.length_px) }}</strong>
                        </div>
                        <div class="metric-item">
                          <span class="label">地表走向</span>
                          <strong class="val">{{ c.metrics?.orientation || '未知走向' }}</strong>
                        </div>
                        <div class="metric-item">
                          <span class="label">影响面积</span>
                          <strong class="val">{{ formatArea(c.metrics?.area_px) }}</strong>
                        </div>
                        <div class="metric-item" v-if="c.metrics?.attitude">
                          <span class="label">产状</span>
                          <strong class="val">{{ c.metrics.attitude }}</strong>
                        </div>
                        <div class="metric-item" v-if="c.metrics?.fractal_dimension">
                          <span class="label">分维数</span>
                          <strong class="val">{{ c.metrics.fractal_dimension }}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div v-else class="results-none">
                  <div class="green-glow-pulse"></div>
                  <p>各项特征分析完毕，未在此地表区域检测到明显的地表开裂与塌陷，地基状态处于安全警戒线内。</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- 测量内容说明弹窗 -->
    <transition name="metrics-fade">
      <div v-if="showMetrics" class="metrics-modal" @click.self="showMetrics = false">
        <div class="metrics-dialog lg-glass" role="dialog" aria-modal="true" aria-label="测量内容与指标定义">
          <div class="metrics-dialog__head">
            <h3>测量内容与指标定义</h3>
            <button class="metrics-close" @click="showMetrics = false" aria-label="关闭">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M3 3l10 10M13 3L3 13"/></svg>
            </button>
          </div>
          <p class="metrics-dialog__intro">系统对每处识别出的裂缝输出以下测量指标。像素值经 GSD（地面采样距离）标定后，自动换算为地表真实物理尺寸。</p>
          <div class="metrics-list">
            <div class="metrics-item" v-for="m in metricDefs" :key="m.name">
              <div class="metrics-item__name">{{ m.name }}<span class="metrics-item__en">{{ m.en }}</span></div>
              <p class="metrics-item__def">{{ m.def }}</p>
            </div>
          </div>
          <p class="metrics-dialog__note">注：产状、联通性、分形维数为大模型基于单张正射影像的推断值，供工程参考；精确测量需结合 DEM 数据与实地复核。</p>
        </div>
      </div>
    </transition>
  </div>
</template>

<script setup>
import { ref, computed, nextTick, onMounted, onBeforeUnmount } from "vue"
import html2canvas from "html2canvas"
import { jsPDF } from "jspdf"

const fileInput = ref(null)
const previewImg = ref(null)
const bboxCanvas = ref(null)
const imageWrap = ref(null)

const imageSrc = ref(null)
const imageFile = ref(null)
const imageFileName = ref("")
const detecting = ref(false)
const detectError = ref("")   // 具体错误信息，空字符串表示无错误
const result = ref(null)
const naturalSize = ref({ w: 0, h: 0 })
const showCalibrator = ref(false)
const hoveredIndex = ref(null)
const showMetrics = ref(false)

// 测量指标定义（与后端大模型输出字段对应）
const metricDefs = [
  { name: "裂缝类型", en: "type", def: "裂缝的成因与形态分类（如沉陷裂缝、张性裂缝、剪切裂缝等），由大模型根据几何形态特征判别。" },
  { name: "几何长度", en: "length_px", def: "裂缝主轴线从起点到终点的延伸长度。像素值经 GSD 标定后换算为地表实际长度（米/厘米）。" },
  { name: "最大宽度", en: "max_width_px", def: "裂缝开口最宽处的宽度，是评估沉陷发育程度与危险等级的核心指标。" },
  { name: "影响面积", en: "area_px", def: "裂缝轮廓所包围的地表区域面积，反映病害的影响范围。" },
  { name: "地表走向", en: "orientation", def: "裂缝延伸的地理方向（如东北-西南走向），可间接反映区域构造应力的主方向。" },
  { name: "裂纹密度", en: "crack_density", def: "单位面积内裂缝发育的密集程度，密度越高说明地表破碎越严重。" },
  { name: "产状", en: "attitude", def: "地质构造要素的空间姿态，用倾向与倾角表示（如倾向120°、倾角45°）。" },
  { name: "联通性", en: "connectivity", def: "裂缝之间的相互连通程度。联通性强意味着地下水渗流通道发育，塌陷扩展风险更高。" },
  { name: "分形维数", en: "fractal_dimension", def: "描述裂缝形态复杂程度的分形特征值，数值越大形态越曲折复杂。" },
  { name: "置信度", en: "confidence", def: "大模型对该处裂缝判定把握程度的估计值（0–100%），供人工复核时参考。" },
  { name: "安全评分", en: "safety_score", def: "系统基于裂缝最大宽度、数量与密度加权计算的综合风险分（0–100），分数越高越安全。" },
]

// History List State
const history = ref([])

// Tooltip State on Canvas hover
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  type: "",
  conf: 0,
  metrics: { width: "", length: "", orientation: "" }
})

// Loading logs stream
const loadingLogs = [
  "无人机航拍影像几何校正中...",
  "载入多模态特征识别算法模型...",
  "正在定位地裂缝走向与边界多边形...",
  "计算像元分辨率并估算塌陷危险评级...",
  "正在生成地质安全评估报告..."
]
const activeLogIndex = ref(0)
let logTimer = null

// Calibration State
const calibration = ref({
  height: 50,
  camera: "zenmuse-h20t",
  gsd: 0.5
})

// Presets for testing
const presets = [
  { name: "酸刺沟典型纵向裂隙", url: "/assets/sample-crack-1.jpg" },
  { name: "塌陷细网状泥裂", url: "/assets/sample-crack-2.jpg" },
  { name: "复杂地表滑移沉降", url: "/assets/sample-crack-3.jpg" }
]

// Camera GSD standard ratio estimation: GSD (cm/px) = H(m) / Factor
// DJI H20T focal length: at 120m GSD is approx 1cm/px (Factor = 120)
// DJI Mavic 3E: GSD is approx 0.8cm/px at 100m (Factor = 125)
const currentGSD = computed(() => {
  if (calibration.value.camera === "zenmuse-h20t") {
    return calibration.value.height / 120
  } else if (calibration.value.camera === "ma3e") {
    return calibration.value.height / 125
  } else {
    return calibration.value.gsd || 0.5
  }
})

// Conversion functions based on GSD scale factor
function formatWidth(px) {
  if (!px) return "N/A"
  const cmVal = px * currentGSD.value
  if (cmVal < 1) {
    return (cmVal * 10).toFixed(1) + " 毫米 (mm)"
  }
  return cmVal.toFixed(1) + " 厘米 (cm)"
}

function formatLength(px) {
  if (!px) return "N/A"
  const cmVal = px * currentGSD.value
  const mVal = cmVal / 100
  if (mVal < 1) {
    return cmVal.toFixed(1) + " 厘米 (cm)"
  }
  return mVal.toFixed(2) + " 米 (m)"
}

function formatArea(px) {
  if (!px) return "N/A"
  const cm2Val = px * Math.pow(currentGSD.value, 2)
  const m2Val = cm2Val / 10000
  if (m2Val < 0.1) {
    return cm2Val.toFixed(1) + " 平方厘米 (cm²)"
  }
  return m2Val.toFixed(3) + " 平方米 (m²)"
}

// Safety Evaluation Metrics
const hasMetrics = computed(() => result.value?.cracks && result.value.cracks.length > 0)

const maxWidthPx = computed(() => {
  if (!hasMetrics.value) return 0
  return Math.max(...result.value.cracks.map(c => c.metrics?.max_width_px || 0))
})

const safetyScore = computed(() => {
  if (!hasMetrics.value) return 100
  const maxWcm = maxWidthPx.value * currentGSD.value
  const count = result.value.cracks.length
  
  let score = 100
  // 综合评判：宽度(40%) + 数量(30%)
  if (maxWcm > 8) score -= 40
  else if (maxWcm > 5) score -= 25
  else if (maxWcm > 3) score -= 15
  else if (maxWcm > 1.5) score -= 5
  
  if (count > 10) score -= 30
  else if (count > 5) score -= 15
  else if (count > 2) score -= 8
  
  return Math.max(0, score)
})

const safetyRating = computed(() => {
  const score = safetyScore.value
  if (score >= 90) return "安全 (Level I)"
  if (score >= 75) return "轻微形变 (Level II)"
  if (score >= 60) return "安全警戒 (Level III)"
  if (score >= 40) return "高危形变 (Level IV)"
  return "严重开裂塌陷 (Level V)"
})

const safetyClass = computed(() => {
  const score = safetyScore.value
  if (score >= 90) return "safety--safe"
  if (score >= 75) return "safety--info"
  if (score >= 60) return "safety--warn"
  return "safety--danger"
})

// Trigger image uploads
function triggerUpload() { fileInput.value?.click() }
function handleFile(e) { const f = e.target.files?.[0]; if (f) loadFile(f) }
function handleDrop(e) { const f = e.dataTransfer?.files?.[0]; if (f) loadFile(f) }

function loadFile(file) {
  imageFile.value = file
  imageFileName.value = file.name
  result.value = null
  const r = new FileReader()
  r.onload = (e) => { imageSrc.value = e.target.result }
  r.readAsDataURL(file)
}

// Preset Loader
async function loadPreset(url, name) {
  try {
    const response = await fetch(url)
    const blob = await response.blob()
    const file = new File([blob], name + ".jpg", { type: "image/jpeg" })
    loadFile(file)
  } catch (err) {
    console.error("加载预设图片失败", err)
  }
}

function clearImage() {
  imageSrc.value = null
  imageFile.value = null
  imageFileName.value = ""
  result.value = null
  naturalSize.value = { w: 0, h: 0 }
  if (fileInput.value) fileInput.value.value = ""
}

function onImageLoad() {
  if (previewImg.value) {
    naturalSize.value = { w: previewImg.value.naturalWidth, h: previewImg.value.naturalHeight }
    nextTick(() => {
      if (result.value) {
        drawBBoxes()
      }
    })
  }
}

async function getImageBase64() {
  return new Promise((resolve) => {
    const r = new FileReader()
    r.onload = (e) => {
      const full = e.target.result
      const i = full.indexOf(",")
      resolve({ base64: full.slice(i + 1), mime: full.slice(5, i).replace(";base64", "") })
    }
    r.readAsDataURL(imageFile.value)
  })
}

// Log streaming simulator for high-tech feeling
function startLogTimer() {
  activeLogIndex.value = 0
  logTimer = setInterval(() => {
    if (activeLogIndex.value < loadingLogs.length - 1) {
      activeLogIndex.value++
    }
  }, 1200)
}

function stopLogTimer() {
  if (logTimer) {
    clearInterval(logTimer)
    logTimer = null
  }
}

async function runDetection() {
  if (!imageFile.value) return
  detecting.value = true
  result.value = null
  detectError.value = ""
  startLogTimer()
  
  try {
    const { base64, mime } = await getImageBase64()
    
    let resp
    try {
      resp = await fetch("/api/detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mime }),
      })
    } catch (fetchErr) {
      // 网络层面的错误（后端未启动 / 断网等）
      detectError.value = "无法连接到检测服务，请确认后端已启动（npm run start）"
      return
    }
    
    if (!resp.ok) {
      const errData = await resp.json().catch(() => ({}))
      if (errData.error?.includes("VOLC_API_KEY")) {
        detectError.value = "API 密钥未配置，请在 backend/.env 中设置 VOLC_API_KEY"
      } else if (resp.status === 413) {
        detectError.value = "图片过大，请压缩后重试（建议小于 10MB）"
      } else {
        detectError.value = `服务异常 (${resp.status})：${errData.error || errData.detail || "未知错误"}`
      }
      return
    }
    
    const data = await resp.json()

    // 检查 LLM 返回的解析错误
    if (data.parseError) {
      detectError.value = "AI 返回格式异常，请重试"
      result.value = data  // 仍然展示原始数据供调试
      return
    }

    result.value = data
    
    // Cache inside History
    saveToHistory(imageSrc.value, imageFileName.value, data.cracks?.length || 0, data)
    
    await nextTick()
    drawBBoxes()
  } catch (err) {
    detectError.value = "未知错误：" + (err.message || "请稍后重试")
  } finally {
    stopLogTimer()
    detecting.value = false
  }
}

// Hover linking triggers redraw
function setHoveredIndex(idx) {
  hoveredIndex.value = idx
  drawBBoxes()
}

// 计算图像在容器中的实际渲染区域（模拟 object-fit: contain 行为）
function getImageRenderRect() {
  const img = previewImg.value
  const wrap = imageWrap.value
  const { w: nw, h: nh } = naturalSize.value
  if (!img || !wrap || !nw || !nh) return null

  const cw = wrap.clientWidth
  const ch = wrap.clientHeight
  if (!cw || !ch) return null

  const scale = Math.min(cw / nw, ch / nh)
  const rw = nw * scale
  const rh = nh * scale
  const rx = (cw - rw) / 2
  const ry = (ch - rh) / 2

  return { x: rx, y: ry, w: rw, h: rh, sx: rw / nw, sy: rh / nh }
}

// Draw bounding boxes AND dynamic contours
function drawBBoxes() {
  const canvas = bboxCanvas.value
  if (!canvas || !result.value?.cracks) return

  const rect = getImageRenderRect()
  if (!rect) return

  // 让 Canvas 严格对齐图像的实际渲染区域
  const cw = Math.round(rect.w)
  const ch = Math.round(rect.h)
  canvas.width = cw
  canvas.height = ch
  canvas.style.left = rect.x + "px"
  canvas.style.top = rect.y + "px"
  canvas.style.width = cw + "px"
  canvas.style.height = ch + "px"

  const { sx, sy } = rect
  const ctx = canvas.getContext("2d")
  ctx.clearRect(0, 0, cw, ch)

  result.value.cracks.forEach((c, idx) => {
    const isHovered = hoveredIndex.value === idx

    // Draw Bbox (Dashed Gold Box)
    if (c.bbox && c.bbox.length === 4) {
      const [x, y, w, h] = c.bbox
      const rx = x * sx
      const ry = y * sy
      const rw = w * sx
      const rh = h * sy

      ctx.save()
      ctx.strokeStyle = isHovered ? "var(--gold)" : "rgba(200, 146, 75, 0.45)"
      ctx.lineWidth = isHovered ? 1.8 : 1.0
      ctx.setLineDash([4, 3])
      ctx.strokeRect(rx, ry, rw, rh)
      ctx.restore()
    }

    // Draw detailed Contour (Solid Glowing Shape)
    if (c.contour && c.contour.length > 0) {
      ctx.save()

      if (isHovered) {
        ctx.shadowColor = "rgba(200, 146, 75, 0.9)"
        ctx.shadowBlur = 10
      }

      ctx.strokeStyle = isHovered ? "#fff" : "var(--gold)"
      ctx.lineWidth = isHovered ? 2.8 : 1.8

      ctx.beginPath()
      ctx.moveTo(c.contour[0][0] * sx, c.contour[0][1] * sy)
      for (let k = 1; k < c.contour.length; k++) {
        ctx.lineTo(c.contour[k][0] * sx, c.contour[k][1] * sy)
      }
      if (c.contour.length > 2) {
        const first = c.contour[0]
        const last = c.contour[c.contour.length - 1]
        const dist = Math.sqrt(Math.pow(first[0] - last[0], 2) + Math.pow(first[1] - last[1], 2))
        if (dist < 50) {
          ctx.closePath()
        }
      }
      ctx.stroke()

      ctx.fillStyle = isHovered ? "rgba(200, 146, 75, 0.28)" : "rgba(200, 146, 75, 0.12)"
      ctx.fill()
      ctx.restore()
    }
  })
}

// Handle canvas mousemove for hovered tooltips
function handleCanvasMouseMove(e) {
  const canvas = bboxCanvas.value
  if (!canvas || !result.value?.cracks) return

  const rect = getImageRenderRect()
  if (!rect) return

  const canvasRect = canvas.getBoundingClientRect()
  const mx = e.clientX - canvasRect.left
  const my = e.clientY - canvasRect.top

  const { sx, sy } = rect

  let foundIdx = -1
  for (let i = 0; i < result.value.cracks.length; i++) {
    const c = result.value.cracks[i]
    if (!c.bbox || c.bbox.length < 4) continue
    const [x, y, w, h] = c.bbox
    const rx = x * sx
    const ry = y * sy
    const rw = w * sx
    const rh = h * sy

    if (mx >= rx && mx <= rx + rw && my >= ry && my <= ry + rh) {
      foundIdx = i
      break
    }
  }

  if (foundIdx !== -1) {
    const activeCrack = result.value.cracks[foundIdx]
    // 转换为图片容器内的相对坐标，避免页面滚动或容器偏移时提示框错位
    tooltip.value.x = mx + rect.x + 16
    tooltip.value.y = my + rect.y - 12
    tooltip.value.visible = true
    tooltip.value.type = activeCrack.type || "沉陷裂缝"
    tooltip.value.conf = Math.round((activeCrack.confidence || 0) * 100)
    tooltip.value.metrics = {
      width: formatWidth(activeCrack.metrics?.max_width_px),
      length: formatLength(activeCrack.metrics?.length_px),
      orientation: activeCrack.metrics?.orientation,
      crack_density: activeCrack.metrics?.crack_density,
      attitude: activeCrack.metrics?.attitude,
      connectivity: activeCrack.metrics?.connectivity,
      fractal_dimension: activeCrack.metrics?.fractal_dimension
    }

    if (hoveredIndex.value !== foundIdx) {
      hoveredIndex.value = foundIdx
      drawBBoxes()
    }
  } else {
    handleCanvasMouseLeave()
  }
}

function handleCanvasMouseLeave() {
  tooltip.value.visible = false
  if (hoveredIndex.value !== null) {
    hoveredIndex.value = null
    drawBBoxes()
  }
}

// Local Session History Caching
function saveToHistory(imgBase64, name, cracksCount, resData) {
  const tempImg = new Image()

  tempImg.onload = () => {
    // 1. 列表缩略图（80x60，仅用于历史列表小图展示）
    const thumbCanvas = document.createElement("canvas")
    thumbCanvas.width = 80
    thumbCanvas.height = 60
    thumbCanvas.getContext("2d").drawImage(tempImg, 0, 0, 80, 60)
    const thumbnail = thumbCanvas.toDataURL("image/jpeg", 0.6)

    // 2. 压缩后的原图副本（最长边 1280px，JPEG 0.7），恢复历史记录时用它还原标注
    const maxSide = 1280
    const scale = Math.min(1, maxSide / Math.max(tempImg.naturalWidth, tempImg.naturalHeight))
    const fullCanvas = document.createElement("canvas")
    fullCanvas.width = Math.round(tempImg.naturalWidth * scale)
    fullCanvas.height = Math.round(tempImg.naturalHeight * scale)
    fullCanvas.getContext("2d").drawImage(tempImg, 0, 0, fullCanvas.width, fullCanvas.height)
    const compressedImage = fullCanvas.toDataURL("image/jpeg", 0.7)

    // 3. 几何坐标（bbox/contour）同步缩放到压缩图尺寸；metrics 保持原图像素口径，保证物理换算不变
    const entry = {
      id: Date.now(),
      name: name || "未知航拍图片",
      time: new Date().toLocaleTimeString("zh-CN", { hour: '2-digit', minute: '2-digit' }),
      cracksCount,
      thumbnail,
      compressedImage,
      result: scaleCrackGeometry(resData, scale)
    }

    history.value.unshift(entry)
    if (history.value.length > 5) history.value.pop()

    // Save to localStorage（超限时自动降级为仅缩略图再重试一次）
    try {
      localStorage.setItem("crack_detect_history", JSON.stringify(history.value))
    } catch (e) {
      console.warn("历史记录超限，降级为仅保存缩略图:", e)
      entry.compressedImage = null
      try {
        localStorage.setItem("crack_detect_history", JSON.stringify(history.value))
      } catch (e2) {
        console.warn("历史记录仍超限，放弃本地存储:", e2)
      }
    }
  }
  tempImg.src = imgBase64
}

// 按比例缩放检测结果中的几何坐标（bbox、contour），使其匹配压缩后的图片尺寸；
// metrics 里的像素指标保持原图口径，保证 GSD 物理换算仍然正确
function scaleCrackGeometry(resData, scale) {
  if (!resData || !resData.cracks || scale >= 1) return resData
  return {
    ...resData,
    cracks: resData.cracks.map(c => ({
      ...c,
      bbox: c.bbox?.length === 4 ? c.bbox.map(v => Math.round(v * scale)) : c.bbox,
      contour: Array.isArray(c.contour)
        ? c.contour.map(p => [Math.round(p[0] * scale), Math.round(p[1] * scale)])
        : c.contour
    }))
  }
}

function loadHistory(item) {
  // 有压缩原图副本时用它恢复完整标注；旧记录只有缩略图则降级展示
  if (item.compressedImage) {
    imageSrc.value = item.compressedImage
  } else {
    imageSrc.value = item.thumbnail
  }
  imageFile.value = null // 历史记录无原文件，禁止重复检测
  imageFileName.value = item.name
  result.value = item.result
  nextTick(() => {
    // triggers canvas redraw once loaded
    onImageLoad()
  })
}

function loadHistoryFromStorage() {
  try {
    const raw = localStorage.getItem("crack_detect_history")
    if (raw) history.value = JSON.parse(raw)
  } catch(e) {
    console.error(e)
  }
}

async function exportToPdf() {
  const element = document.querySelector(".results-body")
  if (!element) return
  
  try {
    const canvas = await html2canvas(element, { scale: 2, useCORS: true, backgroundColor: "#0b0b0f" })
    const imgData = canvas.toDataURL("image/png")
    const pdf = new jsPDF("p", "mm", "a4")
    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width
    pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    pdf.save(`地质沉陷检测报告_${new Date().getTime()}.pdf`)
  } catch (err) {
    console.error("PDF 导出失败", err)
    alert("导出报告失败")
  }
}

// Watch window resize for Canvas alignment recalculation
let resizeObserver = null
onMounted(() => {
  loadHistoryFromStorage()
  resizeObserver = new ResizeObserver(() => {
    if (result.value) {
      drawBBoxes()
    }
  })
  if (imageWrap.value) {
    resizeObserver.observe(imageWrap.value)
  }
})

onBeforeUnmount(() => {
  if (resizeObserver) resizeObserver.disconnect()
})
</script>

<style scoped>
.layout { display: grid; grid-template-columns: minmax(0, 1fr) 400px; gap: 28px; align-items: start; }
.left-panel { display: flex; flex-direction: column; gap: 20px; min-width: 0; }
.right-panel { position: sticky; top: 88px; }
@media (max-width: 1100px) {
  .layout { grid-template-columns: 1fr; }
  .right-panel { position: static; }
}

/* Upload panel styling */
.upload-panel { 
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px dashed rgba(255, 255, 255, 0.15); 
  border-radius: var(--radius-xl); 
  overflow: hidden; 
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
  transition: border-color 0.3s, background 0.3s;
}
.upload-panel:hover {
  border-color: rgba(200, 146, 75, 0.3);
  background: rgba(255, 255, 255, 0.04);
}
.dropzone { padding: 64px 36px 40px; text-align: center; cursor: pointer; color: rgba(255, 255, 255, 0.6); transition: all 0.3s; }
.dropzone__visual {
  background: rgba(255, 255, 255, 0.04);
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 20px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  transition: all 0.3s;
}
.dropzone:hover .dropzone__visual { 
  background: rgba(200, 146, 75, 0.1);
  border-color: rgba(200, 146, 75, 0.3);
}
.uav-pulse {
  animation: pulseStroke 2.2s infinite;
}
@keyframes pulseStroke {
  0%, 100% { opacity: 0.7; }
  50% { opacity: 1; transform: scale(1.05); }
}
.dropzone__text { font-size: 15px; font-weight: 500; margin: 0 0 6px; color: #fff; }
.dropzone__hint { font-size: 12px; color: rgba(255, 255, 255, 0.5); margin-bottom: 28px; }

/* Preset gallery inside dropzone */
.preset-gallery {
  border-top: 1px dashed rgba(255, 255, 255, 0.1);
  padding-top: 24px;
  margin-top: 24px;
}
.preset-title {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gray-500);
  letter-spacing: 0.1em;
  margin-bottom: 14px;
}
.presets {
  display: flex;
  gap: 12px;
  justify-content: center;
}
.preset-item {
  width: 90px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}
.preset-thumb {
  width: 80px;
  height: 52px;
  border-radius: 4px;
  background-size: cover;
  background-position: center;
  border: 1px solid var(--gray-200);
  transition: all 0.25s;
}
.preset-item:hover .preset-thumb {
  border-color: var(--gold);
  transform: translateY(-2px);
  box-shadow: 0 4px 10px rgba(200, 146, 75, 0.2);
}
.preset-label {
  font-size: 10px;
  color: var(--gray-600);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 84px;
}

/* Image preview section */
.preview__wrap { position: relative; background: #0c0c0e; display: flex; align-items: center; justify-content: center; overflow: hidden; }
.preview__img { display: block; width: 100%; height: auto; max-height: 72vh; object-fit: contain; }
.preview__canvas { position: absolute; z-index: 3; }
.preview__bar { display: flex; gap: 10px; align-items: center; justify-content: space-between; flex-wrap: wrap; padding: 12px 18px; background: rgba(16, 16, 20, 0.85); backdrop-filter: blur(16px); -webkit-backdrop-filter: blur(16px); border-top: 1px solid rgba(255, 255, 255, 0.08); }

.btn--sm {
  padding: 8px 16px !important;
  font-size: 12px !important;
  border-radius: 16px !important;
}
.btn--xs {
  padding: 5px 12px !important;
  font-size: 10.5px !important;
  border-radius: 12px !important;
}
.btn--active {
  background: var(--gold-dim) !important;
  border-color: var(--gold) !important;
  color: var(--gold-dark) !important;
}

/* High-tech Scanning animation overlay */
.scanning-overlay {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}
.scanning-line {
  position: absolute;
  left: 0;
  right: 0;
  height: 3px;
  background: linear-gradient(to right, transparent, var(--ice), transparent);
  box-shadow: 0 0 16px rgba(124, 212, 240, 0.7), 0 0 6px var(--ice);
  animation: scanVertical 2.2s linear infinite;
}
.scanning-grid {
  position: absolute;
  inset: 0;
  background-image: linear-gradient(rgba(200, 146, 75, 0.05) 1px, transparent 1px),
                    linear-gradient(90deg, rgba(200, 146, 75, 0.05) 1px, transparent 1px);
  background-size: 24px 24px;
}
@keyframes scanVertical {
  0% { top: 0%; }
  100% { top: 100%; }
}

/* Canvas Tooltip */
.canvas-tooltip {
  position: absolute;
  z-index: 10;
  background: rgba(10, 10, 12, 0.94);
  backdrop-filter: blur(8px);
  border: 1px solid var(--gold);
  border-radius: var(--radius-md);
  padding: 10px 12px;
  color: #fff;
  font-size: 11px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.5);
  pointer-events: none;
  min-width: 140px;
  transition: opacity 0.15s ease;
}
.tooltip-title {
  font-weight: 700;
  font-size: 12px;
  color: var(--gold);
  margin-bottom: 6px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 4px;
}
.tooltip-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}
.tooltip-row span { color: rgba(255, 255, 255, 0.45); }
.tooltip-row strong { color: #fff; }

/* Calibrator Panel */
.calibrator-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: 22px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
}
.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
}
.card-header h3 { font-size: 14px; font-weight: 700; color: #fff; }
.badge {
  background: var(--gold);
  color: #fff;
  font-size: 9px;
  padding: 2px 8px;
  border-radius: 10px;
  font-weight: 600;
}
.calibrator-desc { font-size: 11.5px; color: rgba(255,255,255,0.6); margin-bottom: 16px; }
.form-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 14px; }
.form-group { display: flex; flex-direction: column; gap: 6px; }
.form-group label { font-size: 11px; font-weight: 600; color: rgba(255,255,255,0.7); }
.form-group input, .form-group select {
  height: 34px;
  padding: 0 10px;
  border: 1px solid rgba(255,255,255,0.1);
  border-radius: var(--radius-sm);
  font-size: 12px;
  background: rgba(255,255,255,0.05);
  color: #fff;
  font-family: var(--font);
}
.input-wrap { position: relative; }
.input-wrap input { width: 100%; padding-right: 48px; }
.input-wrap .unit { position: absolute; right: 10px; top: 9px; font-size: 10.5px; color: rgba(255,255,255,0.5); font-weight: 500; }
.calibration-output {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.1);
  font-size: 11.5px;
  color: rgba(255,255,255,0.7);
}
.calibration-output strong { color: var(--gold); }

/* History Card */
.history-card {
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl);
  padding: 20px;
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
}
.history-card h3 { font-size: 13px; font-weight: 700; margin-bottom: 12px; color: #fff; }
.history-list { display: flex; flex-direction: column; gap: 10px; }
.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 10px;
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: var(--radius-md);
  cursor: pointer;
  transition: all 0.25s;
}
.history-item:hover {
  border-color: var(--gold);
  background: rgba(255,255,255,0.05);
  transform: translateX(2px);
}
.history-thumb {
  width: 48px;
  height: 36px;
  border-radius: 4px;
  background-size: cover;
  background-position: center;
  border: 1px solid rgba(255,255,255,0.1);
}
.history-info { flex-grow: 1; min-width: 0; }
.history-name { font-size: 11.5px; font-weight: 600; color: #fff; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
.history-meta { display: flex; gap: 10px; font-size: 10px; color: rgba(255,255,255,0.5); margin-top: 2px; }
.history-meta .count { color: var(--gold); font-weight: 600; }
.history-arrow { font-size: 14px; color: rgba(255,255,255,0.3); transition: color 0.2s; }
.history-item:hover .history-arrow { color: var(--gold); }

/* Results section styling */
.results-panel { 
  background: rgba(255, 255, 255, 0.02);
  backdrop-filter: blur(40px) saturate(180%);
  -webkit-backdrop-filter: blur(40px) saturate(180%);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-xl); 
  padding: 24px; 
  min-height: 480px; 
  box-shadow: 
    inset 0 1px 0 rgba(255, 255, 255, 0.15),
    0 16px 40px rgba(0, 0, 0, 0.45);
}
.results-panel--empty { display: flex; align-items: center; justify-content: center; }
.empty-icon-wrap { margin-bottom: 14px; }
.results-empty { text-align: center; color: rgba(255,255,255,0.4); font-size: 13px; }
.results-empty p { line-height: 1.6; }

/* Error state */
.results-error { padding: 32px 20px; }
.error-card {
  display: flex; flex-direction: column; align-items: center; gap: 12px;
  padding: 24px; border-radius: 10px;
  background: rgba(185, 28, 28, 0.08); border: 1px solid rgba(239, 68, 68, 0.18);
}
.error-card__icon { opacity: 0.8; }
.error-card__msg { color: #fca5a5; font-size: 13px; text-align: center; line-height: 1.5; }
.error-card__retry {
  display: inline-flex; align-items: center; gap: 6px;
  padding: 7px 18px; border-radius: 6px; border: 1px solid var(--gold);
  background: transparent; color: var(--gold); font-size: 13px; font-weight: 600;
  cursor: pointer; transition: all 0.2s;
}
.error-card__retry:hover { background: var(--gold); color: #0c0c0e; }

/* Loading state step logs */
.results-loading { padding: 40px 0 20px; }
.dots-glow { display: flex; justify-content: center; margin-bottom: 18px; }
.dots { display: flex; gap: 6px; }
.dots span { width: 8px; height: 8px; border-radius: 50%; background: var(--gold); animation: dot 1.2s ease-in-out infinite; }
.dots span:nth-child(2) { animation-delay: 0.2s; }
.dots span:nth-child(3) { animation-delay: 0.4s; }
@keyframes dot { 0%,80%,100% { opacity: 0.25; transform: scale(0.85); } 40% { opacity: 1; transform: scale(1); } }
.loading-title { text-align: center; font-size: 13px; color: var(--gold); margin-bottom: 24px; letter-spacing: 0.05em; font-weight: 700; }

.log-stream {
  border-left: 1px solid var(--gray-200);
  margin-left: 12px;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 16px;
}
.log-item {
  display: flex;
  align-items: center;
  gap: 10px;
  position: relative;
  opacity: 0.25;
  transition: opacity 0.3s;
}
.log-item--done {
  opacity: 0.8;
}
.log-item--done .log-dot {
  background: var(--gold);
  border-color: var(--gold);
}
.log-item--active {
  opacity: 1;
}
.log-item--active .log-dot {
  background: var(--white);
  border-color: var(--gold);
  transform: scale(1.2);
  box-shadow: 0 0 8px var(--gold);
}
.log-dot {
  position: absolute;
  left: -23px;
  width: 9px;
  height: 9px;
  border-radius: 50%;
  background: var(--white);
  border: 1.5px solid var(--gray-300);
  transition: all 0.3s;
}
.log-text {
  font-size: 11.5px;
  color: rgba(255, 255, 255, 0.6);
  font-family: var(--font);
}
.log-item--active .log-text {
  color: #fff;
  font-weight: 600;
}

/* Results Content Dashboard */
.safety-dashboard {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: var(--radius-lg);
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 22px;
  margin-bottom: 22px;
}
.safety-score-wrap { flex-shrink: 0; }
.safety-dial {
  width: 72px;
  height: 72px;
  border-radius: 50%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 4px solid rgba(255, 255, 255, 0.1);
}
.safety--safe { border-color: #34c759 !important; color: #34c759 !important; }
.safety--info { border-color: var(--gold) !important; color: var(--gold) !important; }
.safety--warn { border-color: #ff9500 !important; color: #ff9500 !important; }
.safety--danger { border-color: #ff3b30 !important; color: #ff3b30 !important; }

.score-num { font-size: 22px; font-weight: 700; line-height: 1; }
.score-label { font-size: 8px; color: rgba(255, 255, 255, 0.5); font-weight: 500; margin-top: 1px; }

.safety-meta { flex-grow: 1; display: flex; flex-direction: column; gap: 5px; }
.meta-row { display: flex; justify-content: space-between; font-size: 11.5px; color: rgba(255, 255, 255, 0.6); }
.meta-row strong { color: #fff; }

.results-summary { margin-bottom: 24px; }
.results-summary h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.08em; margin-bottom: 6px; }
.results-summary p { font-size: 12.5px; color: rgba(255, 255, 255, 0.7); line-height: 1.6; }

/* Cracks list */
.cracks-section .section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
}
.cracks-section h4 { font-size: 12px; font-weight: 700; text-transform: uppercase; color: var(--gold); letter-spacing: 0.08em; }

.cracks-list { display: flex; flex-direction: column; gap: 10px; }
.crack-card {
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: var(--radius-md);
  padding: 14px 16px;
  transition: all 0.3s;
}
.crack-card--hovered {
  border-color: var(--gold);
  background: rgba(255, 255, 255, 0.06);
  box-shadow: 0 4px 14px rgba(200, 146, 75, 0.08);
}
.crack-card__head {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 6px;
}
.crack-card__title {
  display: flex;
  align-items: center;
  gap: 8px;
}
.idx-badge {
  background: rgba(255, 255, 255, 0.1);
  color: var(--gold);
  font-family: var(--font-mono);
  font-size: 10px;
  font-weight: 700;
  width: 16px;
  height: 16px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}
.type-name { font-size: 12.5px; font-weight: 700; color: #fff; }
.conf-badge { font-size: 10px; color: var(--gold); font-weight: 600; }

.metrics-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px 12px;
}
.metric-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}
.metric-item .label { font-size: 9px; text-transform: uppercase; color: rgba(255, 255, 255, 0.5); letter-spacing: 0.04em; }
.metric-item .val { font-size: 11.5px; color: #fff; font-weight: 600; }

.results-none {
  text-align: center;
  padding: 32px 12px;
  background: rgba(52, 199, 89, 0.03);
  border: 1px dashed rgba(52, 199, 89, 0.3);
  border-radius: var(--radius-md);
  color: var(--gray-600);
  font-size: 12px;
  line-height: 1.6;
}
.green-glow-pulse {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #34c759;
  box-shadow: 0 0 10px #34c759;
  margin: 0 auto 12px;
  animation: greenPulse 2s infinite;
}
@keyframes greenPulse {
  0% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0.7); }
  70% { transform: scale(1.1); box-shadow: 0 0 0 8px rgba(52, 199, 89, 0); }
  100% { transform: scale(0.95); box-shadow: 0 0 0 0 rgba(52, 199, 89, 0); }
}

.spin { animation: spin 0.8s linear infinite; }
@keyframes spin { to { transform: rotate(360deg); } }

/* PDF Print styles */
@media print {
  body {
    background: #fff !important;
    color: #000 !important;
  }
  .nav, .footer, .page-hero, .preview__bar, .calibrator-card, .history-card, .btn--xs, .btn--sm, .preset-gallery {
    display: none !important;
  }
  .detect {
    padding: 0 !important;
    margin: 0 !important;
  }
  .section {
    padding: 0 !important;
  }
  .layout {
    display: block !important;
  }
  .left-panel {
    display: block !important;
    width: 100% !important;
    margin-bottom: 20px;
  }
  .preview {
    border: none !important;
    box-shadow: none !important;
  }
  .preview__wrap {
    background: #fff !important;
  }
  .preview__canvas {
    z-index: 5 !important;
  }
  .right-panel {
    display: block !important;
    width: 100% !important;
    position: static !important;
  }
  .results-panel {
    border: none !important;
    box-shadow: none !important;
    min-height: auto !important;
    padding: 0 !important;
  }
  .safety-dashboard {
    border: 1px solid #ccc !important;
    background: #fff !important;
  }
  .crack-card {
    border: 1px solid #ccc !important;
    page-break-inside: avoid;
  }
}

/* Transitions */
.slide-enter-active, .slide-leave-active { transition: all 0.3s ease-out; }
.slide-enter-from, .slide-leave-to { opacity: 0; transform: translateY(-10px); }

@media (max-width: 900px) {
  .layout { grid-template-columns: 1fr; }
  .right-panel { position: static; }
}

/* ── 测量内容按钮与弹窗 ─────────────────────── */
.metrics-btn { margin-top: 26px; animation: fadeUp 0.7s 0.2s both cubic-bezier(0.16,1,0.3,1); }

.metrics-modal {
  position: fixed;
  inset: 0;
  z-index: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background: rgba(4, 4, 6, 0.6);
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
}
.metrics-dialog {
  width: min(680px, 100%);
  max-height: 82vh;
  overflow-y: auto;
  border-radius: 24px;
  padding: 32px 34px;
  background: rgba(22, 22, 26, 0.78);
}
.metrics-dialog__head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 14px;
}
.metrics-dialog__head h3 {
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  letter-spacing: -0.01em;
}
.metrics-close {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.7);
  cursor: pointer;
  transition: all 0.25s;
}
.metrics-close:hover { background: rgba(255, 255, 255, 0.16); color: #fff; transform: scale(1.06); }
.metrics-dialog__intro {
  font-size: 13px;
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.5);
  margin-bottom: 22px;
}
.metrics-list {
  display: flex;
  flex-direction: column;
}
.metrics-item {
  padding: 14px 0;
  border-top: 1px solid rgba(255, 255, 255, 0.06);
}
.metrics-item__name {
  font-size: 14px;
  font-weight: 700;
  color: var(--ice);
  margin-bottom: 5px;
  display: flex;
  align-items: baseline;
  gap: 8px;
}
.metrics-item__en {
  font-family: var(--font-mono);
  font-size: 11px;
  font-weight: 400;
  color: rgba(124, 212, 240, 0.45);
}
.metrics-item__def {
  font-size: 13px;
  line-height: 1.65;
  color: rgba(255, 255, 255, 0.62);
}
.metrics-dialog__note {
  margin-top: 20px;
  padding: 12px 16px;
  border-radius: 12px;
  background: var(--ice-dim);
  border: 1px solid var(--ice-border);
  font-size: 12px;
  line-height: 1.65;
  color: rgba(124, 212, 240, 0.75);
}

.metrics-fade-enter-active, .metrics-fade-leave-active { transition: opacity 0.3s ease; }
.metrics-fade-enter-from, .metrics-fade-leave-to { opacity: 0; }
.metrics-fade-enter-active .metrics-dialog { transition: transform 0.35s cubic-bezier(0.32, 0.72, 0, 1), opacity 0.3s; }
.metrics-fade-enter-from .metrics-dialog { transform: translateY(24px) scale(0.97); opacity: 0; }
</style>
