import React, { useState } from 'react'
import CommandCard from './CommandCard'
import NoteModal from './NoteModal'
import TreeView from './TreeView'

export default function CommandList({ category, onAdd, onUpdate, onDelete, onSaveNote, allCategories }) {
  const [adding, setAdding] = useState(false)
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [noteOpen, setNoteOpen] = useState(false)
  const [treeView, setTreeView] = useState(false)

  function handleAdd() {
    if (label.trim() && value.trim()) {
      onAdd(category.id, label.trim(), value.trim())
      setLabel('')
      setValue('')
      setAdding(false)
    }
  }

  if (!category) {
    return (
      <main className="command-list empty-state">
        <p>Select a category from the sidebar</p>
      </main>
    )
  }

  return (
    <main className="command-list">
      <div className="command-list-header">
        <div className="header-left">
          <h2 style={{
            fontFamily: category.style?.font || undefined,
            background: category.style?.color || undefined,
            borderRadius: category.style?.color ? '6px' : undefined,
            padding: category.style?.color ? '2px 10px' : undefined,
            color: category.style?.color ? '#1a1208' : undefined,
            display: 'inline-block'
          }}>{category.name}</h2>
          <button
            className="notebook-icon-btn"
            title="Open notebook"
            onClick={() => setNoteOpen(true)}
          >
            📓
          </button>
          <button
            className="notebook-icon-btn"
            title={treeView ? 'Card view' : 'Tree view'}
            onClick={() => setTreeView(v => !v)}
          >
            {treeView ? '▦' : '🌿'}
          </button>
        </div>
        <button className="add-command-btn" onClick={() => setAdding(true)}>+ Add Command</button>
      </div>

      {adding && (
        <div className="add-command-form">
          <input
            placeholder="Label (e.g. Push to main)"
            value={label}
            autoFocus
            onChange={e => setLabel(e.target.value)}
          />
          <textarea
            placeholder="Command (e.g. git push origin main)"
            value={value}
            rows={3}
            onChange={e => setValue(e.target.value)}
          />
          <div className="form-actions">
            <button className="btn-save" onClick={handleAdd}>Add</button>
            <button className="btn-cancel" onClick={() => { setAdding(false); setLabel(''); setValue('') }}>Cancel</button>
          </div>
        </div>
      )}

      {treeView ? (
        <TreeView categories={allCategories || [category]} />
      ) : (
        <div className="cards-grid">
          {category.commands.length === 0 && !adding && (
            <p className="no-commands">No commands yet. Hit "+ Add Command" to start.</p>
          )}
          {category.commands.map(cmd => (
            <CommandCard
              key={cmd.id}
              command={cmd}
              categoryId={category.id}
              contentStyle={category.contentStyle || {}}
              onUpdate={onUpdate}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {noteOpen && (
        <NoteModal
          category={category}
          onSave={onSaveNote}
          onClose={() => setNoteOpen(false)}
        />
      )}
    </main>
  )
}
