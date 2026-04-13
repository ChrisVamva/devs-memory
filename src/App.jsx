import React, { useState, useEffect, useMemo } from 'react'
import Sidebar from './components/Sidebar'
import CommandList from './components/CommandList'
import ImportExport from './components/ImportExport'
import ShortcutsView from './components/ShortcutsView'
import { useStore } from './hooks/useStore'
import { useShortcuts } from './hooks/useShortcuts'

// Get initial theme from localStorage synchronously to avoid flash
const getInitialTheme = () => {
  try {
    return localStorage.getItem('devs-memory-theme') === 'dark'
  } catch {
    return false
  }
}

export default function App() {
  const { categories, addCategory, renameCategory, deleteCategory, styleCategory, updateNote, approveCommand, importData, addCommand, updateCommand, deleteCommand, addSubcategory, deleteSubcategory } = useStore()
  const { shortcuts, tools, addShortcut, updateShortcut, deleteShortcut, toggleFavorite, setState, addTool, deleteTool } = useShortcuts()
  const [selectedId, setSelectedId] = useState(null)
  const [dark, setDark] = useState(getInitialTheme)
  const [showIE, setShowIE] = useState(false)
  const [mode, setMode] = useState('commands') // 'commands' | 'shortcuts'

  // Initialize selectedId after categories load
  useEffect(() => {
    if (categories.length > 0 && selectedId === null) {
      setSelectedId(categories[0].id)
    }
  }, [categories, selectedId])

  // Apply theme when dark changes
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
        onImportExport={() => setShowIE(true)}
        mode={mode}
        onModeChange={setMode}
      />
      {mode === 'commands' ? (
        <CommandList
          category={selectedCategory}
          allCategories={categories}
          onAdd={addCommand}
          onUpdate={updateCommand}
          onDelete={deleteCommand}
          onAddSubcategory={addSubcategory}
          onDeleteSubcategory={deleteSubcategory}
          onApprove={cmd => selectedCategory && approveCommand(selectedCategory.id, cmd.id, cmd.suggestedCategory)}
        />
      ) : (
        <ShortcutsView
          shortcuts={shortcuts}
          tools={tools}
          onAdd={addShortcut}
          onUpdate={updateShortcut}
          onDelete={deleteShortcut}
          onToggleFavorite={toggleFavorite}
          onSetState={setState}
          onAddTool={addTool}
          onDeleteTool={deleteTool}
        />
      )}
      {showIE && (
        <ImportExport
          categories={categories}
          onImport={importData}
          onClose={() => setShowIE(false)}
        />
      )}
    </div>
  )
}
