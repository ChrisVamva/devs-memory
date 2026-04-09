import React, { useState } from 'react'
import StyleModal from './StyleModal'

export default function Sidebar({ categories, selected, onSelect, onAdd, onRename, onDelete, onStyle, dark, onToggleDark }) {
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState(null)
  const [editValue, setEditValue] = useState('')
  const [adding, setAdding] = useState(false)
  const [stylingCat, setStylingCat] = useState(null)

  function handleAdd() {
    if (newName.trim()) {
      onAdd(newName.trim())
      setNewName('')
      setAdding(false)
    }
  }

  function startEdit(cat) {
    setEditingId(cat.id)
    setEditValue(cat.name)
  }

  function commitEdit(id) {
    if (editValue.trim()) onRename(id, editValue.trim())
    setEditingId(null)
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <span className="app-title">Dev's Memory</span>
        <button className="theme-toggle" onClick={onToggleDark} title="Toggle dark mode">
          {dark ? '☀️' : '🌙'}
        </button>
      </div>

      <nav className="category-list">
        {categories.map(cat => {
          const s = cat.style || {}
          return (
            <div
              key={cat.id}
              className={`category-item ${selected === cat.id ? 'active' : ''}`}
              onClick={() => onSelect(cat.id)}
            >
              {editingId === cat.id ? (
                <input
                  className="inline-edit"
                  value={editValue}
                  autoFocus
                  onChange={e => setEditValue(e.target.value)}
                  onBlur={() => commitEdit(cat.id)}
                  onKeyDown={e => {
                    if (e.key === 'Enter') commitEdit(cat.id)
                    if (e.key === 'Escape') setEditingId(null)
                  }}
                  onClick={e => e.stopPropagation()}
                />
              ) : (
                <>
                  <span
                    className="category-name"
                    style={{
                      fontFamily: s.font || undefined,
                      background: s.color || undefined,
                      borderRadius: s.color ? '4px' : undefined,
                      padding: s.color ? '1px 6px' : undefined,
                      color: s.color ? '#1a1208' : undefined,
                    }}
                  >
                    {cat.name}
                  </span>
                  <span className="category-count">{cat.commands.length}</span>
                  <div className="category-actions" onClick={e => e.stopPropagation()}>
                    <button title="Customise" onClick={() => setStylingCat(cat)}>🎨</button>
                    <button title="Rename" onClick={() => startEdit(cat)}>✏️</button>
                    <button title="Delete" onClick={() => onDelete(cat.id)}>🗑️</button>
                  </div>
                </>
              )}
            </div>
          )
        })}
      </nav>

      <div className="sidebar-footer">
        {adding ? (
          <div className="new-category-form">
            <input
              placeholder="Category name"
              value={newName}
              autoFocus
              onChange={e => setNewName(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter') handleAdd()
                if (e.key === 'Escape') setAdding(false)
              }}
            />
            <button onClick={handleAdd}>Add</button>
          </div>
        ) : (
          <button className="add-category-btn" onClick={() => setAdding(true)}>+ New Category</button>
        )}
      </div>

      {stylingCat && (
        <StyleModal
          category={stylingCat}
          onApply={(style, applyToContents) => {
            onStyle(stylingCat.id, style, applyToContents)
            setStylingCat(null)
          }}
          onClose={() => setStylingCat(null)}
        />
      )}
    </aside>
  )
}
