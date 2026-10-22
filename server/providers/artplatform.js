// 美术中台（arthub）provider —— 已通过 router:3080 网关实测摸清全部接口
// 内网网关 router:3080/api/gateway/arthub 透明注入身份（无需 key）
// 公共域名 arthub.zx.com 需要 X-Token 鉴权（同一套接口）
import { getRuntimeConfig } from '../config.js'

// 模型 → service 路由（分图片/视频，同一模型名可能出现在两类）
const SERVICE = {
  image: {
    'gpt-image-2': 'gpt_image_log',
    'gpt-image-2.5-sunburst': 'gpt_image_log',
    'gpt-image-2.5-flare': 'gpt_image_log',
    'gemini-3-pro-image': 'gemini_image_log',
    'gemini-3.1-flash-image': 'gemini_image_log',
    'jimeng_t2i_v40': 'jimeng_image_log',
    'jimeng_seedream46_cvtob': 'jimeng_image_log',
    'kling-image-o1': 'keling_image_log',
    'kling-v3-omni': 'keling_image_log',
    'doubao-seedream-5-0-pro-260628': 'volcengine_image_log',
    'qwen-image-3.0-pro': 'qwen_image_log',
    'qwen-image-3.0': 'qwen_image_log',
  },
  video: {
    'kling-v3-omni': 'keling_video_log',
    'kling-video-o1': 'keling_video_log',
    'doubao-seedance-1-5-pro-251215': 'volcengine_video_log',
    'doubao-seedance-1-0-pro-250528': 'volcengine_video_log',
    'doubao-seedance-1-0-lite-i2v-250428': 'volcengine_video_log',
    'viduq2': 'vidu_video_log',
    'happyhorse': 'happyhorse_video_log',
    'MiniMax-H3': 'minimax_video_log',
    'wan3.0-video': 'wan_video_log',
    'wan3.0-video-prime': 'wan_video_log',
  },
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

function buildHeaders() {
  const { apiKey, authType } = getRuntimeConfig()
  const h = { 'Content-Type': 'application/json' }
  const key = apiKey
  if (authType === 'xtoken' && key) {
    h['X-Token'] = key
    h['X-API-KEY'] = key
  } else if (authType === 'apikey' && key) {
    h['X-API-KEY'] = key
  } else if (authType === 'cookie' && key) {
    h['Cookie'] = key.includes('=') ? key : `arthub_token=${key}`
  }
  return h
}

function buildUrl(path) {
  const { baseUrl } = getRuntimeConfig()
  return (baseUrl || 'https://arthub.zx.com') + path
}

async function post(path, body) {
  const res = await fetch(buildUrl(path), {
    method: 'POST',
    headers: buildHeaders(),
    body: JSON.stringify(body),
  })
  if (!res.ok) {
    const t = await res.text().catch(() => '')
    throw new Error(`HTTP ${res.status}: ${t.slice(0, 300)}`)
  }
  const data = await res.json()
  if (data && typeof data.code === 'number' && data.code !== 0) {
    throw new Error(data.message || `code=${data.code}`)
  }
  return data
}

// 解析结果里的 URL（images/ImageURLs/videos 是 JSON 字符串数组）
function parseUrls(item) {
  const fields = ['ImageURLs', 'images', 'videos', 'videoList', 'videoUrl', 'imageUrl', 'playUrl']
  for (const f of fields) {
    const v = item?.[f]
    if (v == null || v === '' || v === '[]') continue
    if (typeof v === 'string') {
      try {
        const arr = JSON.parse(v)
        if (Array.isArray(arr) && arr.length) return arr
      } catch {
        return [v]
      }
    }
    if (Array.isArray(v) && v.length) return v
  }
  return []
}

export async function artplatformGenerate(payload) {
  const isVideo = payload.type === 't2v' || payload.type === 'i2v' || payload.type === 'f2v'
  const kind = isVideo ? 'video' : 'image'
  const model = payload.model
  const service = SERVICE[kind]?.[model]
  if (!service) throw new Error(`模型「${model}」未映射到 ${kind} 的 service（需在 SERVICE 表里补充）`)

  const body = { service, modelName: model, prompt: payload.prompt || '' }
  if (isVideo) {
    body.videoCount = payload.n || 1
    body.aspectRatio = payload.ratio || '16:9'
    body.duration = payload.duration || 5
    if (payload.firstImage) {
      // 首尾帧：image（字符串）+ imageTail（字符串）
      body.image = payload.firstImage
      if (payload.lastImage) body.imageTail = payload.lastImage
    } else if (payload.images?.length) {
      // 图生视频：imageUrls（数组）
      body.imageUrls = payload.images
    }
  } else {
    const cfg = getRuntimeConfig()
    body.imageSize = cfg.imageSize || '1024x1024'
    body.quality = cfg.quality || 'high'
    body.n = payload.n || 1
    body.outputFormat = 'png'
    // 图生图：imageUrls（数组）
    if (payload.images?.length) body.imageUrls = payload.images
  }

  const t = await post('/generate/' + kind, body)
  const id = t?.data?.id
  if (!id) throw new Error('未取到任务 ID: ' + JSON.stringify(t).slice(0, 200))

  // 轮询结果（status: submitted → processing → succeed / failed）
  for (let i = 0; i < 150; i++) {
    await sleep(4000)
    const r = await post('/generate/' + kind + 'Result', { provider: service, id })
    const item = r?.data?.list?.[0] || {}
    const urls = parseUrls(item)
    if (urls.length) return { kind, url: urls[0], urls }
    if (item.status === 'failed') throw new Error(item.statusMsg || '生成失败')
    if (item.status === 'succeed') throw new Error('任务完成但未解析到结果: ' + JSON.stringify(item).slice(0, 200))
  }
  throw new Error('轮询超时（约 10 分钟）')
}
