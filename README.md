# 穹眸瞰陷 · 无人机地表裂缝智能检测系统

基于多模态大模型（豆包 Doubao）的矿山地表裂缝智能检测系统，前端 Vue 3 + Vite，后端 Express。
并配套 YOLOv8-seg 裂缝分割模型训练管线（`crack-training/`），补足可评测的定量指标。

> 📄 完整技术说明、检测指标定义与论文写作要点见 **[项目技术说明.md](./项目技术说明.md)**

## 快速启动

### 环境要求

- Node.js 18+

### 1. 启动后端

```bash
cd backend
npm install
cp .env.example .env   # 复制后填入真实 API 密钥
npm run dev             # 或 npm start
```

后端运行在 http://localhost:3000 ，检测接口为 `POST /api/detect`。

`.env` 需要配置：

```env
VOLC_API_KEY=你的火山引擎API密钥
VOLC_ENDPOINT_ID=doubao-seed-2-0-pro-260215
```

### 2. 启动前端

```bash
cd frontend
npm install
npm run dev
```

前端运行在 http://localhost:5173 ，通过 Vite 代理将 `/api` 转发到后端 3000 端口（见 `frontend/vite.config.js`）。

## 目录结构

```
检测系统/
├── backend/          # Express 后端（调用豆包大模型 + Canvas 标注）
│   ├── server.js
│   └── .env.example
├── frontend/         # Vue 3 + Vite 前端
│   ├── src/
│   │   ├── views/            # 页面（首页/检测/项目/团队）
│   │   └── composables/      # useThreeEarth 等组合式函数
│   └── vite.config.js
├── crack-training/   # 裂缝分割模型训练（YOLOv8-seg + 公开数据集）
│   ├── train.py / eval.py / predict.py
│   ├── dataset/      # 划分好的数据集（images/labels/masks）
│   └── dataset.yaml
├── 项目技术说明.md    # 技术说明 + 论文写作要点（AI 改论文先读这个）
└── 系统深度评估报告.md # 全栈评估（含科学有效性风险分析）
```
