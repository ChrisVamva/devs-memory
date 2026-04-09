import React, { useState, useEffect } from 'react'
import Sidebar from './components/Sidebar'
import CommandList from './components/CommandList'
import GameBoy from './components/GameBoy'
import { useStore } from './hooks/useStore'

export default function App() {
  const { categories, addCategory, renameCategory, deleteCategory, styleCategory, updateNote, addCommand, updateCommand, deleteCommand } = useStore()
  const [selectedId, setSelectedId] = useState(categories[0]?.id || null)
  const [dark, setDark] = useState(() => localStorage.getItem('devs-memory-theme') === 'dark')

  useEffect(() => {
    document.body.classList.toggle('dark', dark)
    localStorage.setItem('devs-memory-theme', dark ? 'dark' : 'light')
  }, [dark])

  const selectedCategory = categories.find(c => c.id === selectedId) || null

  function handleDeleteCategory(id) {
    deleteCategory(id)
    if (selectedId === id) {
      const remaining = categories.filter(c => c.id !== id)
      setSelectedId(remaining[0]?.id || null)
    }
  }

  return (
    <div className="app">
      <Sidebar
        categories={categories}
        selected={selectedId}
        onSelect={setSelectedId}
        onAdd={addCategory}
        onRename={renameCategory}
        onDelete={handleDeleteCategory}
        onStyle={styleCategory}
        dark={dark}
        onToggleDark={() => setDark(d => !d)}
      />
      <CommandList
        category={selectedCategory}
        onAdd={addCommand}
        onUpdate={updateCommand}
        onDelete={deleteCommand}
        onSaveNote={updateNote}
      />
      <GameBoy />
    </div>
  )
}
