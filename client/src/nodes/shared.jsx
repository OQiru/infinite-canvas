import React from 'react'
import { useFlowStore } from '../store.js'

export function StatusBadge({ status }) {
  const map = {
    idle: '待生成',
    running: '生成中…',
    done: '完成',
    error: '失败',
  }
  return <span className={`cn-status ${status || 'idle'}`}>{map[status] || status}</span>
}

// 从连入的边解析上游输入：返回 { text, images, video }
export function resolveInputs(nodeId) {
  const { nodes, edges } = useFlowStore.getState()
  const incoming = edges.filter((e) => e.target === nodeId)
  const text = []
  const images = []
  const video = []

  for (const e of incoming) {
    const src = nodes.find((n) => n.id === e.source)
    if (!src) continue
    const d = src.data || {}
    if (d.text) text.push(d.text)
    if (d.result) {
      // 上游是生成节点，结果可能是图或视频
      const kind = d.resultKind || inferKind(src.type)
      if (kind === 'image') images.push(d.result)
      if (kind === 'video') video.push(d.result)
    }
    if (d.mediaType === 'image' && d.url) images.push(d.url)
    if (d.mediaType === 'video' && d.url) video.push(d.url)
  }

  return {
    text: text.join('\n'),
    images: dedupe(images),
    video: dedupe(video),
  }
}

function inferKind(type) {
  if (type === 't2v' || type === 'i2v' || type === 'f2v') return 'video'
  return 'image'
}

function dedupe(arr) {
  return [...new Set(arr.filter(Boolean))]
}

// 通用节点外壳
export function NodeShell({ type, color, icon, children }) {
  return (
    <div className="cn">
      <div className="cn-head" style={{ borderTop: `3px solid ${color}` }}>
        <span className="icon">{icon}</span>
        <span>{type}</span>
      </div>
      <div className="cn-body">{children}</div>
    </div>
  )
}

// 读取文件为 dataURL
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const r = new FileReader()
    r.onload = () => resolve(r.result)
    r.onerror = reject
    r.readAsDataURL(file)
  })
}
