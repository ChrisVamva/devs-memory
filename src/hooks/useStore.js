import { useState, useEffect } from 'react'

const DEFAULT_DATA = [
  {
    id: '1',
    name: 'Git',
    commands: [
      { id: '1a', label: 'Status', value: 'git status' },
      { id: '1b', label: 'Push', value: 'git push origin main' },
      { id: '1c', label: 'Pull', value: 'git pull' },
    ]
  },
  {
    id: '2',
    name: 'Docker',
    commands: [
      { id: '2a', label: 'List containers', value: 'docker ps -a' },
      { id: '2b', label: 'Stop all', value: 'docker stop $(docker ps -q)' },
    ]
  }
]

function uid() {
  return Math.random().toString(36).slice(2, 9)
}

export function useStore() {
  const [categories, setCategories] = useState(() => {
    try {
      const saved = localStorage.getItem('devs-memory')
      return saved ? JSON.parse(saved) : DEFAULT_DATA
    } catch {
      return DEFAULT_DATA
    }
  })

  useEffect(() => {
    localStorage.setItem('devs-memory', JSON.stringify(categories))
  }, [categories])

  function addCategory(name) {
    setCategories(prev => [...prev, { id: uid(), name, commands: [], style: {}, note: '' }])
  }

  function updateNote(categoryId, note) {
    setCategories(prev => prev.map(c => c.id === categoryId ? { ...c, note } : c))
  }

  function styleCategory(id, style, applyToContents) {
    setCategories(prev => prev.map(c => {
      if (c.id !== id) return c
      const updated = { ...c, style: { ...c.style, ...style } }
      if (applyToContents) updated.contentStyle = { ...c.contentStyle, ...style }
      return updated
    }))
  }

  function renameCategory(id, name) {
    setCategories(prev => prev.map(c => c.id === id ? { ...c, name } : c))
  }

  function deleteCategory(id) {
    setCategories(prev => prev.filter(c => c.id !== id))
  }

  function addCommand(categoryId, label, value) {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, commands: [...c.commands, { id: uid(), label, value }] }
        : c
    ))
  }

  function updateCommand(categoryId, commandId, label, value) {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, commands: c.commands.map(cmd => cmd.id === commandId ? { ...cmd, label, value } : cmd) }
        : c
    ))
  }

  function deleteCommand(categoryId, commandId) {
    setCategories(prev => prev.map(c =>
      c.id === categoryId
        ? { ...c, commands: c.commands.filter(cmd => cmd.id !== commandId) }
        : c
    ))
  }

  return {
    categories,
    addCategory,
    renameCategory,
    deleteCategory,
    styleCategory,
    updateNote,
    addCommand,
    updateCommand,
    deleteCommand
  }
}
