import { create } from 'zustand'
import { applyNodeChanges, applyEdgeChanges, addEdge } from '@xyflow/react'

const initialNodes = [
  {
    id: 't2i-1',
    type: 't2i',
    position: { x: 120, y: 160 },
    data: { label: '文生图', prompt: '', model: 'gpt-image-2', status: 'idle', result: null },
  },
]

const initialEdges = []

export const useFlowStore = create((set, get) => ({
  nodes: initialNodes,
  edges: initialEdges,

  onNodesChange: (changes) =>
    set({ nodes: applyNodeChanges(changes, get().nodes) }),

  onEdgesChange: (changes) =>
    set({ edges: applyEdgeChanges(changes, get().edges) }),

  onConnect: (conn) => set({ edges: addEdge(conn, get().edges) }),

  addNode: (type, position) => {
    const id = `${type}-${Date.now()}`
    const node = {
      id,
      type,
      position,
      data: { label: type, prompt: '', model: null, status: 'idle', result: null },
    }
    set({ nodes: [...get().nodes, node] })
    return id
  },

  updateNodeData: (id, patch) =>
    set({
      nodes: get().nodes.map((n) =>
        n.id === id ? { ...n, data: { ...n.data, ...patch } } : n,
      ),
    }),

  removeNode: (id) =>
    set({
      nodes: get().nodes.filter((n) => n.id !== id),
      edges: get().edges.filter((e) => e.source !== id && e.target !== id),
    }),

  clearCanvas: () => set({ nodes: [], edges: [] }),
}))
