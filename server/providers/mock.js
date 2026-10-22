// Mock provider：无真实 API 时用于端到端跑通 UI。
// 生成一张带提示词的占位 SVG 图，方便验证画布/连线/节点流程。

const KIND = {
  t2i: 'image',
  i2i: 'image',
  t2v: 'video',
  i2v: 'video',
  f2v: 'video',
}

export async function mockGenerate(payload) {
  // 模拟异步耗时
  await new Promise((r) => setTimeout(r, 800))

  const { type, prompt, model } = payload
  const label = {
    t2i: '文生图',
    i2i: '图生图',
    t2v: '文生视频',
    i2v: '图生视频',
    f2v: '首尾帧生视频',
  }[type] || type

  const text = (prompt || '（空提示词）').slice(0, 120)
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="640" height="640">
  <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
    <stop offset="0" stop-color="#4f7cff"/><stop offset="1" stop-color="#a855f7"/>
  </linearGradient></defs>
  <rect width="640" height="640" fill="url(#g)"/>
  <text x="32" y="60" font-family="sans-serif" font-size="28" fill="#fff" font-weight="bold">MOCK · ${label}</text>
  <text x="32" y="100" font-family="sans-serif" font-size="16" fill="#e0e7ff">model: ${model || '-'}</text>
  ${text.split('\n').map((line, i) => `<text x="32" y="${150 + i * 26}" font-family="sans-serif" font-size="18" fill="#fff">${escapeXml(line)}</text>`).join('')}
</svg>`

  return {
    kind: KIND[type] || 'image',
    url: 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64'),
    mock: true,
  }
}

function escapeXml(s) {
  return s.replace(/[<>&'"]/g, (c) => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' }[c]))
}
