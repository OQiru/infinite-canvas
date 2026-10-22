// 美术中台 provider —— 桥接 arthub（中旭未来）
// 鉴权：X-Token / X-API-KEY / Cookie(arthub_token)
// 真实接口：/generate/image 和 /generate/video，需 service + modelName 字段

import { getRuntimeConfig } from '../config.js'

// 模型 → service 映射（从 arthub 接口实际返回读取）
const SERVICE_MAP = {
  // 图片服务
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
  // 视频服务
  'kling-video-o1': 'keling_video_log',
  'seedance-2.5': 'volcengine_video_log',
  'seedance-2.0': 'volcengine_video_log',
  'seedance-2.0-fast': 'volcengine_video_log',
  'seedance-2.0-mini': 'volcengine_video_log',
  'viduq2': 'vidu_video_log',
  'happyhorse': 'happyhorse_video_log',
}

// 各能力对应的接口路径（arthub 真实路径）
const ENDPOINTS = {
  t2i: '/generate/image',
  i2i: '/generate/image',
  t2v: '/generate/video',
  i2v: '/generate/video',
  f2v: '/generate/video',
}

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

function buildUrl(endpoint) {
  const { baseUrl } = getRuntimeConfig()
  return (baseUrl || 'https://arthub.zx.com') + endpoint
}

// 把通用 payload 映射为美术中台的请求体
function buildBody(payload) {
  const { model, prompt, images, firstImage, lastImage } = payload
  const { imageSize } = getRuntimeConfig()
  const body = { prompt }

  // service + modelName（arthub 要求）
  if (model) {
    body.modelName = model
    const service = SERVICE_MAP[model]
    if (service) body.service = service
  }

  // 图片尺寸（arthub 要求 imageSize 字段）
  if (imageSize) body.imageSize = imageSize

  // 图生图/图生视频：加参考图
  if (images && images.length > 0) {
    body.image = images[0]
    if (images.length > 1) body.images = images
  }

  // 首尾帧生视频
  if (firstImage) body.first_frame = firstImage
  if (lastImage) body.last_frame = lastImage

  return body
}

// 解析返回结果
function parseResponse(type, data) {
  // arthub 返回格式：{ code: 0, message: "...", data: { url: "..." } }
  if (data && typeof data.code === 'number' && data.code !== 0) {
    throw new Error(`美术中台错误: ${data.message || `code=${data.code}`}`)
  }

  const url =
    data?.data?.url ||
    data?.data?.video_url ||
    data?.data?.image_url ||
    data?.url ||
    data?.video_url ||
    data?.image_url ||
    null

  if (!url) {
    // 返回里没 URL 时，把整个返回丢给前端看，便于定位
    throw new Error('美术中台返回结果中没有 URL: ' + JSON.stringify(data).slice(0, 300))
  }

  const kind = type === 't2v' || type === 'i2v' || type === 'f2v' ? 'video' : 'image'
  return { kind, url }
}

export async function artplatformGenerate(payload) {
  const endpoint = ENDPOINTS[payload.type]
  if (!endpoint) throw new Error(`未知任务类型: ${payload.type}`)

  const url = buildUrl(endpoint)
  const headers = buildHeaders()
  const body = buildBody(payload)

  console.log(`[artplatform] ${payload.type} -> ${url}`)
  console.log(`[artplatform] body keys:`, Object.keys(body))

  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  })

  if (!res.ok) {
    const text = await res.text().catch(() => '')
    throw new Error(`美术中台返回 ${res.status}: ${text.slice(0, 300)}`)
  }

  const data = await res.json()
  return parseResponse(payload.type, data)
}
