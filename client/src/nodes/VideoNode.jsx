import React, { useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import { NodeShell, readFileAsDataURL } from './shared.jsx'
import { useFlowStore } from '../store.js'

export default function VideoNode({ id, data }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData)
  const fileRef = useRef(null)
  const url = data.url || data.result || null

  const onPick = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await readFileAsDataURL(f)
    updateNodeData(id, { url: dataUrl, mediaType: 'video' })
  }

  return (
    <NodeShell type="视频" color="#8b5cf6" icon="🎬">
      <Handle type="target" position={Position.Left} id="in" />
      {url ? (
        <video className="cn-media" src={url} controls muted />
      ) : (
        <div className="cn-media slot">未选择视频（可从上游连线或点击上传）</div>
      )}
      <input ref={fileRef} type="file" accept="video/*" style={{ display: 'none' }} onChange={onPick} />
      <button className="cn-btn" onClick={() => fileRef.current?.click()}>
        上传视频
      </button>
      <Handle type="source" position={Position.Right} id="out" />
    </NodeShell>
  )
}
