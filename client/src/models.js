// 美术中台聚合模型清单（从截图提取，可按需增删）
export const MODEL_CATALOG = {
  image: [
    { id: 'jimeng_t2i_v40', name: '即梦 T2I v4.0', note: '多参图像与价格敏感场景' },
    { id: 'jimeng_seedream46_cvtob', name: '即梦 Seedream 4.6', note: '人像写真/平面设计/风格化' },
    { id: 'gpt-image-2', name: 'GPT Image 2', note: '产品图/广告图，尺寸可控' },
    { id: 'gpt-image-2.5-sunburst', name: 'GPT Image 2.5 Sunburst', note: '编辑精度最高' },
    { id: 'gpt-image-2.5-flare', name: 'GPT Image 2.5 Flare', note: '快速款，日常出图' },
    { id: 'gemini-3-pro-image', name: 'Gemini 3 Pro Image', note: '自然语言理解强' },
    { id: 'gemini-3.1-flash-image', name: 'Gemini 3.1 Flash Image', note: '复杂图像/4K' },
    { id: 'kling-image-o1', name: '可灵 Image O1', note: '主体一致性/多图组合' },
    { id: 'kling-v3-omni', name: '可灵 V3 Omni', note: '主体一致性/多图组合' },
    { id: 'doubao-seedream-5-0-pro-260628', name: '豆包 Seedream 5.0 Pro', note: '专业单图生成/编辑' },
    { id: 'qwen-image-3.0-pro', name: '千问 Image 3.0 Pro', note: '字体/文字，价格最低' },
    { id: 'qwen-image-3.0', name: '千问 Image 3.0', note: '质量与速度兼顾' },
  ],
  video: [
    { id: 'kling-v3-omni', name: '可灵 V3 Omni', note: '默认推荐，综合质感最好' },
    { id: 'kling-video-o1', name: '可灵 Video O1', note: '多图/多视频/element 组合' },
    { id: 'seedance-2.5', name: '火山 Seedance 2.5', note: '30 秒连贯直出' },
    { id: 'seedance-2.0', name: '火山 Seedance 2.0', note: '电影感/海报感' },
    { id: 'seedance-2.0-fast', name: '火山 Seedance 2.0 Fast', note: '快速版' },
    { id: 'seedance-2.0-mini', name: '火山 Seedance 2.0 mini', note: '轻量低成本' },
    { id: 'viduq2', name: 'Vidu Q2', note: '多主体/音频 BGM 直出' },
    { id: 'happyhorse', name: 'HappyHorse', note: '按输入媒体自动推断' },
    { id: 'minimax-h3', name: 'MiniMax H3', note: '文生/首尾帧/2K 直出' },
    { id: 'wan3.0-video', name: '万相 Wan 3.0', note: '多任务模式，原生 3…' },
    { id: 'wan3.0-video-prime', name: '万相 Wan 3.0 Prime', note: '高速版，原生 30 秒' },
  ],
  agent: [
    { id: 'glm-5.3-flash', name: 'GLM-5.3-Flash', note: '原生多模态，低成本' },
    { id: 'deepseek-v4.1', name: 'DeepSeek-V4.1', note: '旗舰混合推理' },
  ],
}

// 节点类型定义
export const NODE_TYPES = {
  text: { label: '文本输入', icon: '📝', category: 'input', color: '#3b82f6' },
  image: { label: '图片', icon: '🖼️', category: 'input', color: '#10b981' },
  video: { label: '视频', icon: '🎬', category: 'input', color: '#8b5cf6' },
  t2i: { label: '文生图', icon: '✨', category: 'image', color: '#f59e0b' },
  i2i: { label: '图生图', icon: '🖌️', category: 'image', color: '#ef4444' },
  t2v: { label: '文生视频', icon: '🎥', category: 'video', color: '#ec4899' },
  i2v: { label: '图生视频', icon: '🎞️', category: 'video', color: '#14b8a6' },
  f2v: { label: '首尾帧生视频', icon: '🔁', category: 'video', color: '#6366f1' },
}

export const CATEGORY_LABELS = {
  input: '素材/输入',
  image: '图像生成',
  video: '视频生成',
}
