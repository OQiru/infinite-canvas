# 无限画布 · AI 创作工作流

LibTV 风格的节点化无限画布，本地运行，桥接公司「美术中台」的个人 API key，用画布 + 连线组织文生图 / 图生图 / 文生视频 / 图生视频 / 首尾帧生视频等工作流。

## 结构

```
infinite-canvas/
├── client/            React + Vite + @xyflow/react 前端（无限画布）
│   └── src/
│       ├── models.js       模型清单 + 节点类型定义
│       ├── store.js        zustand 画布状态
│       ├── nodes/          自定义节点（文本/图片/视频/生成）
│       └── App.jsx         画布 + 侧边栏 + 右键菜单
└── server/            Node + Express 后端（代理美术中台 API）
    ├── config.js           读取 .env 配置
    ├── providers/
    │   ├── mock.js         无真实 API 时的占位 provider（跑通 UI）
    │   └── artplatform.js  美术中台 adapter（按接口文档补全）
    └── index.js            /api/generate /api/health
```

## 快速开始

```bash
cd infinite-canvas
npm install
npm run dev
```

前端 http://localhost:5173 ，后端 http://localhost:8787 。

**默认是 mock 模式**（未配置 API 时），可以直接体验画布和连线，生成的是占位图。

## 接入公司美术中台

1. 复制 `.env.example` 为 `server/.env`，填写：

```bash
ART_API_BASE_URL=https://你的美术中台域名
ART_API_KEY=你的个人key
ART_API_AUTH_TYPE=bearer        # bearer | header | query
```

2. 打开 `server/providers/artplatform.js`，按接口文档补全三处：
   - `ENDPOINTS`：各能力的接口路径
   - `buildBody`：请求体字段映射
   - `parseResponse`：返回结果里图片/视频 URL 的取值路径
   - （若为异步任务）`artplatformPollTask`：轮询接口

3. 重启后端即可。

> 拿到美术中台的接口文档后，把文档贴给我，我直接帮你把这几个函数填好。

## 使用说明

- 左侧栏点击节点类型，或双击画布空白处，新增节点
- 节点之间拖拽连线：把上游的图片/视频/文本喂给下游生成节点
- 生成节点里选模型、填提示词（或连线文本节点）、点「生成」
- 右键节点可删除
- 首尾帧生视频节点有两个输入口：首帧 / 尾帧

## 模型清单（已从截图提取）

Image：即梦、GPT-Image、Gemini、可灵、豆包、千问
Video：可灵、火山 Seedance、Vidu、HappyHorse、MiniMax H3、万相
Agent：GLM-5.3-Flash、DeepSeek-V4.1

（可在 `client/src/models.js` 增删）
