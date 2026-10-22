import dotenv from 'dotenv'
import path from 'node:path'
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: path.join(__dirname, '.env') })

const CONFIG_FILE = path.join(__dirname, 'config.json')

// 运行时可变的配置：先读 .env，再用 config.json（网页里保存的）覆盖
const runtime = {
  port: Number(process.env.PORT || 8787),
  baseUrl: process.env.ART_API_BASE_URL || 'https://arthub.zx.com',
  apiKey: process.env.ART_API_KEY || '',
  authType: process.env.ART_API_AUTH_TYPE || 'xtoken',
  imageSize: process.env.ART_IMAGE_SIZE || '1024x1024',
  provider: 'mock',
}

// 从 config.json 加载（网页里保存的配置，优先于 .env 里的 key）
try {
  const saved = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf8'))
  if (saved.apiKey) runtime.apiKey = saved.apiKey
  if (saved.baseUrl) runtime.baseUrl = saved.baseUrl
  if (saved.authType) runtime.authType = saved.authType
  if (saved.imageSize) runtime.imageSize = saved.imageSize
} catch {
  // 无 config.json 或解析失败，忽略
}

runtime.provider = process.env.ART_PROVIDER || (runtime.apiKey ? 'artplatform' : 'mock')

export function getRuntimeConfig() {
  return runtime
}

export function setRuntimeConfig(patch) {
  if (patch.apiKey !== undefined) runtime.apiKey = patch.apiKey
  if (patch.baseUrl !== undefined) runtime.baseUrl = patch.baseUrl
  if (patch.authType !== undefined) runtime.authType = patch.authType
  if (patch.imageSize !== undefined) runtime.imageSize = patch.imageSize
  runtime.provider = runtime.apiKey ? 'artplatform' : 'mock'
  try {
    fs.writeFileSync(
      CONFIG_FILE,
      JSON.stringify(
        {
          baseUrl: runtime.baseUrl,
          apiKey: runtime.apiKey,
          authType: runtime.authType,
          imageSize: runtime.imageSize,
        },
        null,
        2,
      ),
    )
  } catch (e) {
    console.error('[config] 持久化失败:', e.message)
  }
  return runtime
}

export function isConfigured() {
  return Boolean(runtime.baseUrl && runtime.apiKey)
}

// 兼容旧引用
export const config = runtime
