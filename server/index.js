import express from 'express'
import cors from 'cors'
import { getRuntimeConfig, setRuntimeConfig, isConfigured } from './config.js'
import { mockGenerate } from './providers/mock.js'
import { artplatformGenerate } from './providers/artplatform.js'

const app = express()
app.use(cors())
app.use(express.json({ limit: '50mb' })) // 允许较大的 base64 图片/视频

// 健康检查
app.get('/api/health', (req, res) => {
  const c = getRuntimeConfig()
  res.json({
    ok: true,
    provider: c.provider,
    configured: isConfigured(),
    baseUrl: c.baseUrl,
  })
})

// 读取配置（apiKey 脱敏返回）
app.get('/api/config', (req, res) => {
  const c = getRuntimeConfig()
  const masked = c.apiKey
    ? c.apiKey.slice(0, 4) + '****' + c.apiKey.slice(-4)
    : ''
  res.json({
    baseUrl: c.baseUrl,
    authType: c.authType,
    imageSize: c.imageSize,
    quality: c.quality,
    configured: isConfigured(),
    apiKeyMasked: masked,
  })
})

// 保存配置（网页里填的 API key 会持久化到 server/config.json）
app.post('/api/config', (req, res) => {
  const { apiKey, baseUrl, authType, imageSize, quality } = req.body || {}
  const patch = {}
  if (typeof apiKey === 'string' && apiKey.trim()) patch.apiKey = apiKey.trim()
  if (typeof baseUrl === 'string' && baseUrl.trim()) patch.baseUrl = baseUrl.trim()
  if (typeof authType === 'string' && authType.trim()) patch.authType = authType.trim()
  if (typeof imageSize === 'string' && imageSize.trim()) patch.imageSize = imageSize.trim()
  if (typeof quality === 'string' && quality.trim()) patch.quality = quality.trim()

  if (Object.keys(patch).length === 0) {
    return res.status(400).json({ error: '没有需要保存的字段' })
  }

  setRuntimeConfig(patch)
  const c = getRuntimeConfig()
  res.json({
    ok: true,
    provider: c.provider,
    configured: isConfigured(),
    apiKeyMasked: c.apiKey ? c.apiKey.slice(0, 4) + '****' + c.apiKey.slice(-4) : '',
  })
})

// 统一生成入口
app.post('/api/generate', async (req, res) => {
  const { type } = req.body || {}
  if (!type) return res.status(400).json({ error: '缺少 type 字段' })

  try {
    const c = getRuntimeConfig()
    let result
    if (c.provider === 'mock') {
      result = await mockGenerate(req.body)
    } else if (c.provider === 'artplatform') {
      if (!isConfigured()) {
        return res.status(500).json({ error: '还没配置 API key，点右上角「设置」填入 arthub token' })
      }
      result = await artplatformGenerate(req.body)
    } else {
      return res.status(500).json({ error: `未知 provider: ${c.provider}` })
    }

    res.json(result)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
})

app.listen(getRuntimeConfig().port, () => {
  const c = getRuntimeConfig()
  console.log(`[infinite-canvas] server on http://localhost:${c.port}  (provider=${c.provider})`)
})
