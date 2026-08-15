/**
 * 穹眸瞰陷 — 无人机地表裂缝智能检测后端服务
 *
 * 接收前端 Base64 图片，调用火山引擎豆包多模态大模型 (doubao-seed-2.0-pro)
 * 进行零样本地表裂缝识别，返回带标注的结构化检测结果。
 *
 * @module server
 */

const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { createCanvas, loadImage } = require('canvas');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.send('<h1>✅ 裂缝检测服务后端已成功启动！</h1><p>请前端向 <b>POST /api/detect</b> 接口发送图片数据进行检测。</p>');
});

/**
 * 豆包大模型 System Prompt
 * 强约束地质裂缝检测任务，引导 LLM 输出标准 JSON。
 * @constant {string}
 */
const SYSTEM_PROMPT = `你是一个专业的工业与地质缺陷检测模型。请分析这张无人机航拍的地表图片，识别其中的沉陷裂缝。
严格输出JSON格式，禁止任何额外解释。JSON结构必须如下：
{
  "cracks": [
    {
      "bbox": [0.30, 0.40, 0.12, 0.04], 
      "contour": [[0.30,0.40], [0.42,0.41], [0.38,0.46]], 
      "metrics": {
        "length_px": 120,
        "max_width_px": 5,
        "area_px": 600,
        "orientation": "东北-西南走向",
        "crack_density": "0.15",
        "attitude": "倾向120°，倾角45°",
        "connectivity": "强",
        "fractal_dimension": "1.24"
      },
      "type": "沉陷裂缝",
      "confidence": 0.95
    }
  ], 
  "summary": "画面中发现1条明显的横向沉陷裂缝，风险较高。"
}
【坐标规范 - 极其重要】bbox 和 contour 必须使用归一化坐标（0 到 1 之间的小数，相对图片整体）：
- bbox = [x, y, width, height]，其中 x、width 是相对图片宽度的比例，y、height 是相对图片高度的比例。例如 bbox [0.5, 0.5, 0.2, 0.1] 表示位于图片中央、宽占 20%、高占 10% 的框。
- contour 中每个点 [x, y] 同样用 0~1 归一化：x 相对图片宽度，y 相对图片高度。
- 严禁输出像素坐标，务必输出 0~1 的小数。
- metrics 中的 length_px / max_width_px / area_px 用估算的像素值即可。
如果图片中没有裂缝，请返回空的 cracks 数组。`;

/**
 * @typedef {Object} CrackMetrics
 * @property {number} [length_px] - 裂缝像素长度
 * @property {number} [max_width_px] - 最大像素宽度
 * @property {number} [area_px] - 像素面积
 * @property {string} [orientation] - 走向描述
 */

/**
 * @typedef {Object} Crack
 * @property {number[]} bbox - [x, y, width, height] 像素坐标
 * @property {number[][]} contour - 轮廓关键点 [[x,y], ...]
 * @property {CrackMetrics} metrics - 几何指标
 * @property {string} type - 裂缝类型
 * @property {number} confidence - 置信度 0-1
 */

/**
 * @typedef {Object} DetectResult
 * @property {Crack[]} cracks - 检测到的裂缝列表
 * @property {string} [summary] - AI 生成的分析摘要
 * @property {string} [annotatedImageBase64] - 带标注的 data URI
 */

/**
 * 从 LLM 原始文本中提取有效的 JSON 对象。
 * 处理三步容错：去 markdown 标记 → JSON.parse → 非贪婪正则兜底。
 *
 * @param {string} rawContent - LLM 返回的原始文本
 * @returns {Object} 解析后的 JSON 对象，失败时包含 raw/parseError 字段
 */
function extractJSON(rawContent) {
  // 1. 去掉 markdown 代码块标记
  let content = rawContent.replace(/```(?:json)?\s*([\s\S]*?)```/g, '$1').trim();

  // 2. 尝试直接解析
  try {
    return JSON.parse(content);
  } catch {
    // 3. 非贪婪正则提取第一个完整 JSON 对象
    const jsonMatch = content.match(/\{(?:[^{}]|\{(?:[^{}]|\{[^{}]*\})*\})*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch {
        return { raw: content, parseError: 'JSON 格式异常，请检查 AI 返回' };
      }
    }
    return { raw: content, parseError: '未能提取到有效 JSON' };
  }
}

/**
 * 规范化裂缝数据，确保必填字段有默认值。
 *
 * @param {Crack[]} cracks - LLM 返回的原始裂缝数组
 * @returns {Crack[]} 规范化后的裂缝数组
 */
function normalizeCracks(cracks) {
  return cracks.map((crack) => ({
    bbox: crack.bbox || [],
    contour: crack.contour || [],
    metrics: crack.metrics || {},
    type: crack.type || '裂缝',
    confidence: typeof crack.confidence === 'number' ? crack.confidence : 0.5,
  }));
}

/**
 * POST /api/detect
 *
 * 接收无人机航拍图片 (Base64)，调用豆包多模态大模型进行裂缝检测，
 * 返回结构化检测结果 + 带标注的图片。
 *
 * @name detect
 * @route {POST} /api/detect
 * @param {string} req.body.imageBase64 - 图片 Base64 编码
 * @param {string} [req.body.mime='image/jpeg'] - 图片 MIME 类型
 * @returns {DetectResult} JSON
 */
app.post('/api/detect', async (req, res) => {
  try {
    const { imageBase64, mime } = req.body;
    const imageMime = mime || 'image/jpeg';

    if (!imageBase64) {
      return res.status(400).json({ error: '缺少 imageBase64 参数' });
    }

    const apiKey = process.env.VOLC_API_KEY;
    const endpointId = process.env.VOLC_ENDPOINT_ID;

    if (!apiKey || apiKey === '请手动替换为真实API密钥') {
      return res.status(500).json({ error: '请先在 backend/.env 中配置真实的 VOLC_API_KEY' });
    }

    const response = await axios.post(
      'https://ark.cn-beijing.volces.com/api/v3/chat/completions',
      {
        model: endpointId,
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          {
            role: 'user',
            content: [
              { type: 'image_url', image_url: { url: `data:${imageMime};base64,${imageBase64}` } },
              { type: 'text', text: '请检测这张无人机航拍图片中的地表裂缝，严格按JSON格式返回结果。' },
            ],
          },
        ],
      },
      {
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
        timeout: 60000,  // 大模型推理可能需要较长时间
      }
    );

    let content = response.data.choices?.[0]?.message?.content || '{}';
    console.log('=== AI 原始返回内容 ===');
    console.log(content);

    // 多层 JSON 提取与容错
    let result = extractJSON(content);

    // 规范化裂缝数据
    if (result.cracks && Array.isArray(result.cracks)) {
      result.cracks = normalizeCracks(result.cracks);
    }

    // 5. 使用 canvas 绘制带标注的图片（红框=bbox, 蓝线=contour）
    try {
      const imgBuffer = Buffer.from(imageBase64, 'base64');
      const image = await loadImage(imgBuffer);
      const canvas = createCanvas(image.width, image.height);
      const ctx = canvas.getContext('2d');
      
      // 画原图
      ctx.drawImage(image, 0, 0, image.width, image.height);
      
      // 画标注
      result.cracks.forEach(crack => {
        const { bbox, metrics, contour } = crack;
        const W = image.width;
        const H = image.height;
        
        // 画矩形框 (红框) — bbox 为归一化坐标，乘回原图尺寸
        if (bbox && bbox.length === 4) {
          const [nx, ny, nw, nh] = bbox;
          const x = nx * W, y = ny * H, w = nw * W, h = nh * H;
          ctx.strokeStyle = 'red';
          ctx.lineWidth = Math.max(3, Math.floor(W / 500)); // 线宽自适应图片大小
          ctx.strokeRect(x, y, w, h);
          
          // 写文字信息
          ctx.fillStyle = 'red';
          const fontSize = Math.max(20, Math.floor(W / 50));
          ctx.font = `bold ${fontSize}px Arial`;
          let textY = y > fontSize ? y - 10 : y + fontSize + 10;
          let infoText = crack.type;
          if (metrics) {
             if(metrics.length_px) infoText += ` L:${metrics.length_px}px`;
             if(metrics.max_width_px) infoText += ` W:${metrics.max_width_px}px`;
          }
          ctx.fillText(infoText, x, textY);
        }

        // 画多边形轮廓 (蓝线) — contour 为归一化坐标，乘回原图尺寸
        if (contour && contour.length > 0) {
          ctx.strokeStyle = 'blue';
          ctx.lineWidth = Math.max(2, Math.floor(W / 800));
          ctx.beginPath();
          ctx.moveTo(contour[0][0] * W, contour[0][1] * H);
          for (let i = 1; i < contour.length; i++) {
            ctx.lineTo(contour[i][0] * W, contour[i][1] * H);
          }
          // 判断首尾点距离决定是否闭合路径 (归一化距离<0.05则视为闭合)
          if (contour.length > 2) {
            const first = contour[0];
            const last = contour[contour.length - 1];
            const dist = Math.sqrt(Math.pow(first[0] - last[0], 2) + Math.pow(first[1] - last[1], 2));
            if (dist < 0.05) {
              ctx.closePath();
            }
          }
          ctx.stroke();
        }
      });
      
      // 将画好的 canvas 转回 base64 (带 data URI 前缀)
      const annotatedDataUrl = canvas.toDataURL(imageMime);
      result.annotatedImageBase64 = annotatedDataUrl; // 直接返回完整的 data URI，方便前端 <img src="...">
    } catch (drawErr) {
      console.error('绘制标注图失败:', drawErr);
      result.annotatedImageError = '绘图失败: ' + drawErr.message;
    }

    console.log('=== 解析后结果 ===');
    console.log(JSON.stringify(result, null, 2));

    res.setHeader('Content-Type', 'application/json; charset=utf-8');
    res.json(result);
  } catch (error) {
    console.error('检测请求失败:', error.message);
    if (error.response) {
      console.error('API 响应错误:', error.response.status, JSON.stringify(error.response.data));
    }
    res.status(500).json({
      error: '检测服务异常',
      detail: error.message,
    });
  }
});

app.listen(PORT, () => {
  console.log(`裂缝检测服务已启动: http://localhost:${PORT}`);
  console.log(`检测接口: POST http://localhost:${PORT}/api/detect`);
});
