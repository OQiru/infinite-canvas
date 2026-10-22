import React, { useCallback, useState } from 'react'
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  useReactFlow,
} from '@xyflow/react'
import { useFlowStore } from './store.js'
import { nodeTypes } from './nodes/index.js'
import { NODE_TYPES, CATEGORY_LABELS } from './models.js'
import { getHealth } from './api.js'
import SettingsModal from './components/SettingsModal.jsx'

const categoryOrder = ['input', 'image', 'video']

function CanvasInner() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, addNode, removeNode } =
    useFlowStore()
  const { screenToFlowPosition } = useReactFlow()
  const [menu, setMenu] = useState(null)
  const [health, setHealth] = useState(null)
  const [showSettings, setShowSettings] = useState(false)

  // 双击画布添加节点
  const onPaneDoubleClick = useCallback(
    (e) => {
      const pos = screenToFlowPosition({ x: e.clientX, y: e.clientY })
      addNode('t2i', pos)
    },
    [screenToFlowPosition, addNode],
  )

  const onNodeContextMenu = useCallback(
    (e, node) => {
      e.preventDefault()
      setMenu({ x: e.clientX, y: e.clientY, nodeId: node.id })
    },
    [],
  )

  const closeMenu = () => setMenu(null)

  const checkHealth = async () => {
    try {
      const h = await getHealth()
      setHealth(h)
    } catch {
      setHealth({ ok: false })
    }
  }

  return (
    <div className="app" onContextMenu={(e) => e.preventDefault()}>
      <div className="topbar">
        <span className="title">🎨 无限画布 · AI 创作工作流</span>
        <span className="spacer" />
        <button
          className="btn"
          onClick={checkHealth}
          title="检查后端连接"
        >
          {health
            ? health.ok
              ? '✅ 已连接'
              : '❌ 未连接'
            : '🔌 检查连接'}
        </button>
        <button
          className="btn primary"
          onClick={() => setShowSettings(true)}
        >
          ⚙️ 设置
        </button>
      </div>

      <div className="main">
        <div className="sidebar">
          {categoryOrder.map((cat) => {
            const items = Object.entries(NODE_TYPES).filter(([, v]) => v.category === cat)
            return (
              <div key={cat}>
                <div className="group-title">{CATEGORY_LABELS[cat]}</div>
                {items.map(([type, v]) => (
                  <div
                    key={type}
                    className="node-item"
                    onClick={() => addNode(type, { x: 120 + Math.random() * 60, y: 120 + Math.random() * 60 })}
                  >
                    <span className="icon">{v.icon}</span>
                    <span>{v.label}</span>
                  </div>
                ))}
              </div>
            )
          })}
        </div>

        <div className="canvas-wrap">
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            onPaneDoubleClick={onPaneDoubleClick}
            onNodeContextMenu={onNodeContextMenu}
            fitView
            minZoom={0.05}
            maxZoom={4}
            deleteKeyCode={['Backspace', 'Delete']}
          >
            <Background variant={BackgroundVariant.Dots} gap={18} size={1} color="#2a2f3a" />
            <Controls />
            <MiniMap
              nodeColor={(n) => NODE_TYPES[n.type]?.color || '#4b5563'}
              maskColor="rgba(15,17,21,0.7)"
            />
          </ReactFlow>
          <div className="hint">双击空白处新增节点 · 右键节点删除/复制 · 拖拽连线传递素材</div>
        </div>
      </div>

      {menu && (
        <div className="context-menu" style={{ left: menu.x, top: menu.y }} onClick={closeMenu}>
          <div className="menu-item" onClick={() => addNode('t2i', { x: menu.x, y: menu.y })}>
            新增文生图
          </div>
          <div className="menu-item danger" onClick={() => removeNode(menu.nodeId)}>
            删除节点
          </div>
        </div>
      )}

      {showSettings && (
        <SettingsModal
          onClose={() => setShowSettings(false)}
          onSaved={() => setHealth(null)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <ReactFlowProvider>
      <CanvasInner />
    </ReactFlowProvider>
  )
}
