import { useState, useEffect, useCallback } from 'react'

const DEFAULT_TOOLS = [
  'Git', 'VS Code', 'Docker', 'Terminal', 'Browser', 'Other'
]

const DEFAULT_SHORTCUTS = [
  { id: 's1', keys: ['Ctrl', 'Shift', 'P'], action: 'Command Palette', tool: 'VS Code', state: 'mastered', favorite: false, note: '' },
  { id: 's2', keys: ['Ctrl', '`'],          action: 'Toggle Terminal',  tool: 'VS Code', state: 'known',    favorite: true,  note: '' },
  { id: 's3', keys: ['Ctrl', 'Z'],          action: 'Undo',             tool: 'VS Code', state: 'mastered', favorite: false, note: '' },
  { id: 's4', keys: ['git', 'log', '--oneline'], action: 'Compact log', tool: 'Git',     state: 'learning', favorite: false, note: '' },
]

function uid() {
  const arr = new Uint8Array(9)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('').slice(0, 9)
}

async function loadShortcuts() {
  try {
    const data = await window.electronAPI?.readData()
    if (data?.shortcuts) return { shortcuts: data.shortcuts, tools: data.shortcutTools || DEFAULT_TOOLS }
  } catch {}
  try {
    const saved = localStorage.getItem('devs-memory-shortcuts')
    if (saved) return JSON.parse(saved)
  } catch {}
  return { shortcuts: DEFAULT_SHORTCUTS, tools: DEFAULT_TOOLS }
}

async function saveShortcuts(shortcuts, tools) {
  try {
    const data = await window.electronAPI?.readData() || {}
    await window.electronAPI?.writeData({ ...data, shortcuts, shortcutTools: tools })
  } catch {
    localStorage.setItem('devs-memory-shortcuts', JSON.stringify({ shortcuts, tools }))
  }
}

export function useShortcuts() {
  const [shortcuts, setShortcuts] = useState(DEFAULT_SHORTCUTS)
  const [tools, setTools] = useState(DEFAULT_TOOLS)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    loadShortcuts().then(({ shortcuts: s, tools: t }) => {
      setShortcuts(s)
      setTools(t)
      setReady(true)
    })
  }, [])

  useEffect(() => {
    if (!ready) return
    saveShortcuts(shortcuts, tools)
  }, [shortcuts, tools, ready])

  const update = useCallback(fn => setShortcuts(prev => fn(prev)), [])

  function addShortcut(keys, action, tool) {
    update(prev => [...prev, { id: uid(), keys, action, tool, state: 'new', favorite: false, note: '' }])
  }

  function updateShortcut(id, fields) {
    update(prev => prev.map(s => s.id === id ? { ...s, ...fields } : s))
  }

  function deleteShortcut(id) {
    update(prev => prev.filter(s => s.id !== id))
  }

  function toggleFavorite(id) {
    update(prev => prev.map(s => s.id === id ? { ...s, favorite: !s.favorite } : s))
  }

  function setState(id, state) {
    update(prev => prev.map(s => s.id === id ? { ...s, state } : s))
  }

  function addTool(name) {
    if (!tools.includes(name)) setTools(prev => [...prev, name])
  }

  function deleteTool(name) {
    setTools(prev => prev.filter(t => t !== name))
    update(prev => prev.filter(s => s.tool !== name))
  }

  return { shortcuts, tools, addShortcut, updateShortcut, deleteShortcut, toggleFavorite, setState, addTool, deleteTool }
}
