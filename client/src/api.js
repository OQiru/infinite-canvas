// 后端 API 客户端。所有生成请求统一走 POST /api/generate
// 后端负责把请求转成公司美术中台的调用。

export async function generate(payload) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || `请求失败 (${res.status})`)
  }
  return data
}

// 查询任务状态（若美术中台是异步任务模式）
export async function getTask(taskId) {
  const res = await fetch(`/api/task/${taskId}`)
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || `查询失败 (${res.status})`)
  return data
}

// 健康检查 / 服务信息
export async function getHealth() {
  const res = await fetch('/api/health')
  return res.json().catch(() => ({}))
}

// 读取配置（apiKey 脱敏）
export async function getConfig() {
  const res = await fetch('/api/config')
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || '读取配置失败')
  return data
}

// 保存配置
export async function saveConfig(patch) {
  const res = await fetch('/api/config', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(patch),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) throw new Error(data.error || '保存配置失败')
  return data
}
