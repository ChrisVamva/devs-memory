import { useState, useEffect, useCallback } from 'react'

const DEFAULT_DATA = [
  {
    id: '1',
    name: 'Git',
    commands: [
      { id: '1a', label: 'Status',       value: 'git status', subcategory: 'Local' },
      { id: '1b', label: 'Push',         value: 'git push origin main', subcategory: 'Remote' },
      { id: '1c', label: 'Pull',         value: 'git pull', subcategory: 'Remote' },
    ],
    subcategories: ['Local', 'Remote'],
    style: {}, note: ''
  },
  {
    id: '2',
    name: 'Docker',
    commands: [
      { id: '2a', label: 'List containers', value: 'docker ps -a' },
      { id: '2b', label: 'Stop all',        value: 'docker stop $(docker ps -q)' },
    ],
    subcategories: [],
    style: {}, note: ''
  }
]

function uid() {
  // Use crypto.getRandomValues for better uniqueness than Math.random()
  const arr = new Uint8Array(9)
  crypto.getRandomValues(arr)
  return Array.from(arr, b => b.toString(16).padStart(2, '0')).join('').slice(0, 9)
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
    if (!window.electronAPI?.onDataChanged) return
    const handler = (data) => {
      if (Array.isArray(data)) setCategories(data)
    }
    window.electronAPI.onDataChanged(handler)
    // Cleanup: unsubscribe when component unmounts
    return () => window.electronAPI?.offDataChanged?.(handler)
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
    update(prev => [...prev, { id: uid(), name, commands: [], subcategories: [], style: {}, note: '' }])
  }

  function addSubcategory(categoryId, name) {
    update(prev => prev.map(c => c.id === categoryId ? { ...c, subcategories: [...(c.subcategories || []), name] } : c))
  }

  function deleteSubcategory(categoryId, name) {
    update(prev => prev.map(c => c.id === categoryId ? { 
      ...c, 
      subcategories: (c.subcategories || []).filter(s => s !== name),
      commands: c.commands.map(cmd => cmd.subcategory === name ? { ...cmd, subcategory: undefined } : cmd)
    } : c))
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
    // Validate incoming data structure
    if (!Array.isArray(incoming)) {
      console.error('Import failed: expected array')
      return
    }
    const valid = incoming.every(cat => 
      cat && typeof cat === 'object' && 
      typeof cat.name === 'string' &&
      Array.isArray(cat.commands)
    )
    if (!valid) {
      console.error('Import failed: invalid structure')
      return
    }
    update(prev => {
      const merged = [...prev]
      incoming.forEach(cat => {
        const existing = merged.find(c => c.name.toLowerCase() === cat.name.toLowerCase())
        if (existing) {
          cat.commands?.forEach(cmd => {
            if (cmd && cmd.label && cmd.value && !existing.commands.find(c => c.label === cmd.label)) {
              existing.commands.push({ ...cmd, id: uid() })
            }
          })
        } else {
          merged.push({ 
            id: uid(), 
            name: cat.name, 
            commands: cat.commands?.filter(c => c?.label && c?.value).map(c => ({ ...c, id: uid() })) || [],
            style: cat.style || {},
            note: cat.note || ''
          })
        }
      })
      return merged
    })
  }

  function approveCommand(categoryId, commandId, targetCategoryName) {
    update(prev => {
      const data = prev.map(c => ({ ...c, commands: [...c.commands] }))
      const inbox = data.find(c => c.id === categoryId)
      const cmd   = inbox?.commands.find(c => c.id === commandId)
      if (!cmd) return prev
      inbox.commands = inbox.commands.filter(c => c.id !== commandId)
      const { pending, suggestedCategory, reason, ...cleanCmd } = cmd
      const targetName = targetCategoryName || suggestedCategory
      let target = targetName ? data.find(c => c.name.toLowerCase() === targetName.toLowerCase()) : null
      if (!target) target = inbox
      target.commands.push(cleanCmd)
      return data
    })
  }

  function addCommand(categoryId, label, value, subcategory) {
    update(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, commands: [...c.commands, { id: uid(), label, value, subcategory }] }
        : c
    ))
  }

  function updateCommand(categoryId, commandId, label, value, subcategory) {
    update(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, commands: c.commands.map(cmd => cmd.id === commandId ? { ...cmd, label, value, subcategory: subcategory !== undefined ? subcategory : cmd.subcategory } : cmd) }
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
    addSubcategory, deleteSubcategory,
    approveCommand, importData, addCommand, updateCommand, deleteCommand
  }
}
