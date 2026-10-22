// 美术中台 provider —— 桥接 arthub.zx.com
// 鉴权：X-Token / X-API-KEY / Cookie(arthub_token)

import { getRuntimeConfig } from '../config.js'

// 各能力对应的接口路径（按实际文档调整）
const ENDPOINTS = {
  t2i: '/gemini/image',
  i2i: '/gemini/image',       // TODO: 确认图生图路径
  t2v: '/gemini/video',       // TODO: 确认文生视频路径
  i2v: '/gemini/video',       // TODO: 确认图生视频路径
  f2v: '/gemini/video',       // TODO: 确认首尾帧路径
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
  const { type, model, prompt, images, firstImage, lastImage } = payload
  const { imageSize } = getRuntimeConfig()
  const body = { prompt }
  
  // 如果有指定模型，加上 model 字段
  if (model) body.model = model
  
  // 图片尺寸（arthub 要求 imageSize 字段）
  if (imageSize) body.imageSize = imageSize
  
  // 图生图/图生视频：加参考图
  if (images && images.length > 0) {
    body.image = images[0]  // 单图参考
    if (images.length > 1) body.images = images  // 多图参考
  }
  
  // 首尾帧生视频
  if (firstImage) body.first_frame = firstImage
  if (lastImage) body.last_frame = lastImage
  
  return body
}

// 解析返回结果
function parseResponse(type, data) {
  // arthub 返回格式：{ code: 0, message: "...", data: { url: "..." } }
  if (data.code !== 0) {
    throw new Error(`美术中台错误: ${data.message || `code=${data.code}`}`)
  }
  
  const url = data.data?.url || data.data?.video_url || data.url || data.video_url
  if (!url) {
    throw new Error('美术中台返回结果中没有 URL')
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
