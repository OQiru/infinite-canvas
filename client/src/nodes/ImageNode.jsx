import React, { useRef } from 'react'
import { Handle, Position } from '@xyflow/react'
import { NodeShell, readFileAsDataURL } from './shared.jsx'
import { useFlowStore } from '../store.js'

export default function ImageNode({ id, data }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData)
  const fileRef = useRef(null)
  const url = data.url || data.result || null

  const onPick = async (e) => {
    const f = e.target.files?.[0]
    if (!f) return
    const dataUrl = await readFileAsDataURL(f)
    updateNodeData(id, { url: dataUrl, mediaType: 'image' })
  }

  return (
    <NodeShell type="图片" color="#10b981" icon="🖼️">
      <Handle type="target" position={Position.Left} id="in" />
      {url ? (
        <img className="cn-media" src={url} alt="preview" />
      ) : (
        <div className="cn-media slot">未选择图片（可从上游连线或点击上传）</div>
      )}
      <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={onPick} />
      <button className="cn-btn" onClick={() => fileRef.current?.click()}>
        上传图片
      </button>
      <Handle type="source" position={Position.Right} id="out" />
    </NodeShell>
  )
}
