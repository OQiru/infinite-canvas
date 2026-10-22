import React from 'react'
import { Handle, Position } from '@xyflow/react'
import { NodeShell } from './shared.jsx'
import { useFlowStore } from '../store.js'

export default function TextNode({ id, data }) {
  const updateNodeData = useFlowStore((s) => s.updateNodeData)
  return (
    <NodeShell type="文本输入" color="#3b82f6" icon="📝">
      <textarea
        placeholder="输入提示词或文本…"
        value={data.text || ''}
        onChange={(e) => updateNodeData(id, { text: e.target.value })}
      />
      <Handle type="source" position={Position.Right} id="out" />
    </NodeShell>
  )
}
