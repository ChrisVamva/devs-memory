import { useState, useEffect, useCallback } from 'react'

const DEFAULT_DATA = [
  {
    id: '1',
    name: 'Git',
    commands: [
      { id: '1a', label: 'Status',       value: 'git status' },
      { id: '1b', label: 'Push',         value: 'git push origin main' },
      { id: '1c', label: 'Pull',         value: 'git pull' },
    ],
    style: {}, note: ''
  },
  {
    id: '2',
    name: 'Docker',
    commands: [
      { id: '2a', label: 'List containers', value: 'docker ps -a' },
      { id: '2b', label: 'Stop all',        value: 'docker stop $(docker ps -q)' },
    ],
    style: {}, note: ''
  }
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

async function loadFromDisk() {
  try {
    const data = await window.electronAPI?.readData()
    if (Array.isArray(data) && data.length > 0) return data
  } catch {}
  // fallback to localStorage for dev without electron
  try {
    const saved = localStorage.getItem('devs-memory')
    if (saved) return JSON.parse(saved)
  } catch {}
  return DEFAULT_DATA
}

export function useStore() {
  const [categories, setCategories] = useState(DEFAULT_DATA)
  const [ready, setReady] = useState(false)

  // Initial load
  useEffect(() => {
    loadFromDisk().then(data => {
      setCategories(data)
      setReady(true)
    })
  }, [])

  // Listen for external changes (MCP server writes)
  useEffect(() => {
    window.electronAPI?.onDataChanged(data => {
      if (Array.isArray(data)) setCategories(data)
    })
  }, [])

  // Persist on every change (after initial load)
  useEffect(() => {
    if (!ready) return
    if (window.electronAPI?.writeData) {
      window.electronAPI.writeData(categories)
    } else {
      localStorage.setItem('devs-memory', JSON.stringify(categories))
    }
  }, [categories, ready])

  const update = useCallback(fn => setCategories(prev => fn(prev)), [])

  function addCategory(name) {
    update(prev => [...prev, { id: uid(), name, commands: [], style: {}, note: '' }])
  }

  function renameCategory(id, name) {
    update(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }

  function deleteCategory(id) {
    update(prev => prev.filter(c => c.id !== id))
  }

  function styleCategory(id, style, applyToContents) {
    update(prev => prev.map(c => {
      if (c.id !== id) return c
      const updated = { ...c, style: { ...c.style, ...style } }
      if (applyToContents) updated.contentStyle = { ...c.contentStyle, ...style }
      return updated
    }))
  }

  function updateNote(categoryId, note) {
    update(prev => prev.map(c => c.id === categoryId ? { ...c, note } : c))
  }

  function importData(incoming) {
    update(prev => {
      const merged = [...prev]
      incoming.forEach(cat => {
        const existing = merged.find(c => c.name.toLowerCase() === cat.name.toLowerCase())
        if (existing) {
          cat.commands?.forEach(cmd => {
            if (!existing.commands.find(c => c.label === cmd.label)) {
              existing.commands.push({ ...cmd, id: uid() })
            }
          })
        } else {
          merged.push({ ...cat, id: uid() })
        }
      })
      return merged
    })
  }
    update(prev => {
      const data = prev.map(c => ({ ...c, commands: [...c.commands] }))
      const inbox = data.find(c => c.id === categoryId)
      const cmd   = inbox?.commands.find(c => c.id === commandId)
      if (!cmd) return prev
      inbox.commands = inbox.commands.filter(c => c.id !== commandId)
      const { pending, suggestedCategory, reason, ...cleanCmd } = cmd
      const targetName = targetCategoryName || suggestedCategory
      let target = targetName ? data.find(c => c.name.toLowerCase() === targetName.toLowerCase()) : null
      if (!target) target = inbox // fallback: keep in inbox as approved
      target.commands.push(cleanCmd)
      return data
    })
  }
    update(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, commands: [...c.commands, { id: uid(), label, value }] }
        : c
    ))
  }

  function updateCommand(categoryId, commandId, label, value) {
    update(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, commands: c.commands.map(cmd => cmd.id === commandId ? { ...cmd, label, value } : cmd) }
        : c
    ))
  }

  function deleteCommand(categoryId, commandId) {
    update(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, commands: c.commands.filter(cmd => cmd.id !== commandId) }
        : c
    ))
  }

  return {
    categories,
    addCategory, renameCategory, deleteCategory, styleCategory, updateNote,
    approveCommand, importData, addCommand, updateCommand, deleteCommand
  }
}
