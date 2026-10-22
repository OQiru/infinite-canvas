import React, { useState } from 'react'
import { Handle, Position } from '@xyflow/react'
import { NodeShell, StatusBadge } from './shared.jsx'
import { useFlowStore } from '../store.js'
import { MODEL_CATALOG } from '../models.js'
import { generate } from '../api.js'

// 每种生成节点的配置
const GEN_CONFIG = {
  t2i: { label: '文生图', icon: '✨', color: '#f59e0b', kind: 'image', modelGroup: 'image' },
  i2i: { label: '图生图', icon: '🖌️', color: '#ef4444', kind: 'image', modelGroup: 'image' },
  t2v: { label: '文生视频', icon: '🎥', color: '#ec4899', kind: 'video', modelGroup: 'video' },
  i2v: { label: '图生视频', icon: '🎞️', color: '#14b8a6', kind: 'video', modelGroup: 'video' },
  f2v: { label: '首尾帧生视频', icon: '🔁', color: '#6366f1', kind: 'video', modelGroup: 'video' },
}

// 解析指定 handle 连入的上游数据
function resolveByHandle(nodeId, targetHandle) {
  const { nodes, edges } = useFlowStore.getState()
  const found = { text: '', images: [], video: [] }
  for (const e of edges) {
    if (e.target !== nodeId) continue
    if (e.targetHandle && e.targetHandle !== targetHandle) continue
    const src = nodes.find((n) => n.id === e.source)
    if (!src) continue
    const d = src.data || {}
    if (d.text) found.text = (found.text ? found.text + '\n' : '') + d.text
    if (d.url && d.mediaType === 'image') found.images.push(d.url)
    if (d.url && d.mediaType === 'video') found.video.push(d.url)
    if (d.result) {
      const k = d.resultKind || (src.type === 't2v' || src.type === 'i2v' || src.type === 'f2v' ? 'video' : 'image')
      if (k === 'image') found.images.push(d.result)
      if (k === 'video') found.video.push(d.result)
    }
  }
  return found
}

export default function GenerateNode({ id, type, data }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData)
  const cfg = GEN_CONFIG[type]
  const models = MODEL_CATALOG[cfg.modelGroup] || []
  const model = data.model || models[0]?.id || ''
  const [running, setRunning] = useState(false)

  const needsImage = type === 'i2i' || type === 'i2v'
  const isF2V = type === 'f2v'

  const run = async () => {
    setRunning(true)
    updateNodeData(id, { status: 'running' })
    try {
      const payload = {
        type,
        model,
        prompt: data.prompt || '',
        images: [],
        video: [],
      }

      if (isF2V) {
        const first = resolveByHandle(id, 'first')
        const last = resolveByHandle(id, 'last')
        payload.firstImage = first.images[0] || null
        payload.lastImage = last.images[0] || null
      } else if (needsImage) {
        const up = resolveByHandle(id, 'image')
        payload.images = up.images
      }

      const textUp = resolveByHandle(id, 'text')
      if (textUp.text && !payload.prompt) payload.prompt = textUp.text

      const res = await generate(payload)
      updateNodeData(id, {
        status: 'done',
        result: res.url || res.result || null,
        resultKind: res.kind || cfg.kind,
      })
    } catch (err) {
      updateNodeData(id, { status: 'error', error: err.message })
    } finally {
      setRunning(false)
    }
  }

  const result = data.result
  const isVideo = cfg.kind === 'video'

  return (
    <NodeShell type={cfg.label} color={cfg.color} icon={cfg.icon}>
      <div className="cn-row" style={{ justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: '#8a90a0' }}>{cfg.label}</span>
        <StatusBadge status={data.status || 'idle'} />
      </div>

      {/* 输入 handles */}
      {isF2V ? (
        <>
          <Handle type="target" position={Position.Left} id="first" style={{ top: '38%' }} title="首帧" />
          <Handle type="target" position={Position.Left} id="last" style={{ top: '70%' }} title="尾帧" />
        </>
      ) : needsImage ? (
        <Handle type="target" position={Position.Left} id="image" title="输入图片" />
      ) : (
        <Handle type="target" position={Position.Left} id="text" title="输入提示词" />
      )}

      <div>
        <label>提示词（可连线文本节点覆盖）</label>
        <textarea
          placeholder="描述你想生成的内容…"
          value={data.prompt || ''}
          onChange={(e) => updateNodeData(id, { prompt: e.target.value })}
        />
      </div>

      <div>
        <label>模型</label>
        <select value={model} onChange={(e) => updateNodeData(id, { model: e.target.value })}>
          {models.map((m) => (
            <option key={m.id} value={m.id}>
              {m.name}
            </option>
          ))}
        </select>
      </div>

      <button className="cn-btn" onClick={run} disabled={running}>
        {running ? '生成中…' : '生成'}
      </button>

      {data.error && <div style={{ color: '#fca5a5', fontSize: 11 }}>{data.error}</div>}

      {result && (
        <div>
          {isVideo ? (
            <video className="cn-media" src={result} controls muted />
          ) : (
            <img className="cn-media" src={result} alt="result" />
          )}
        </div>
      )}

      <Handle type="source" position={Position.Right} id="out" />
    </NodeShell>
  )
}
