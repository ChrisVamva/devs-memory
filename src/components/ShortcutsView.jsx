import React, { useState } from 'react'
import ShortcutCard from './ShortcutCard'
import { KeyCombo } from './Keycap'

export default function ShortcutsView({ shortcuts, tools, onAdd, onUpdate, onDelete, onToggleFavorite, onSetState, onAddTool, onDeleteTool }) {
  const [selectedTool, setSelectedTool] = useState('all')
  const [adding, setAdding] = useState(false)
  const [newKeys, setNewKeys] = useState('')
  const [newAction, setNewAction] = useState('')
  const [newTool, setNewTool] = useState(tools[0] || 'Other')
  const [newToolName, setNewToolName] = useState('')
  const [addingTool, setAddingTool] = useState(false)
  const [search, setSearch] = useState('')

  const filtered = shortcuts.filter(s => {
    const matchTool = selectedTool === 'all' || s.tool === selectedTool
    const matchSearch = !search || s.action.toLowerCase().includes(search.toLowerCase()) || s.keys.join(' ').toLowerCase().includes(search.toLowerCase())
    return matchTool && matchSearch
  })

  const favorites = filtered.filter(s => s.favorite)
  const byTool = tools.reduce((acc, t) => {
    const group = filtered.filter(s => s.tool === t)
    if (group.length) acc[t] = group
    return acc
  }, {})

  function handleAdd() {
    if (!newKeys.trim() || !newAction.trim()) return
    // Normalize: split by '+' and normalize each key (lowercase except modifiers)
    const parsedKeys = newKeys.split('+').map(k => {
      const key = k.trim().toLowerCase()
      // Keep these uppercase
      if (['ctrl', 'alt', 'shift', 'cmd', 'command', 'meta'].includes(key)) {
        return key === 'cmd' ? 'Ctrl' : key.charAt(0).toUpperCase() + key.slice(1)
      }
      return key.charAt(0).toUpperCase() + key.slice(1)
    }).filter(Boolean)
    onAdd(parsedKeys, newAction.trim(), newTool)
    setNewKeys(''); setNewAction(''); setAdding(false)
  }

  function handleAddTool() {
    if (newToolName.trim()) {
      onAddTool(newToolName.trim())
      setNewTool(newToolName.trim())
      setNewToolName('')
      setAddingTool(false)
    }
  }

  return (
    <main className="command-list">
      <div className="command-list-header">
        <div className="header-left">
          <h2>Shortcuts</h2>
        </div>
        <button className="add-command-btn" onClick={() => setAdding(true)}>+ Add Shortcut</button>
      </div>

      {/* Search + tool filter */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
        <input
          className="card-label-input"
          placeholder="Search..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          style={{ flex: 1, minWidth: 120, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border)' }}
        />
        <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
          <button
            className={`shortcut-tool-btn ${selectedTool === 'all' ? 'active' : ''}`}
            onClick={() => setSelectedTool('all')}
          >All</button>
          {tools.map(t => (
            <button
              key={t}
              className={`shortcut-tool-btn ${selectedTool === t ? 'active' : ''}`}
              onClick={() => setSelectedTool(t)}
            >{t}</button>
          ))}
        </div>
      </div>

      {/* Add form */}
      {adding && (
        <div className="add-command-form">
          <input
            placeholder="Action (e.g. Open Command Palette)"
            value={newAction}
            autoFocus
            onChange={e => setNewAction(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setAdding(false) }}
          />
          <input
            placeholder="Keys (e.g. Ctrl + Shift + P)"
            value={newKeys}
            onChange={e => setNewKeys(e.target.value)}
            onKeyDown={e => { if (e.key === 'Escape') setAdding(false) }}
            style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '15px' }}
          />
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={newTool}
              onChange={e => setNewTool(e.target.value)}
              style={{ flex: 1, background: 'var(--bg-code)', border: '1px solid var(--border)', borderRadius: 6, padding: '6px 10px', fontFamily: "'Caveat', cursive", fontSize: '16px', color: 'var(--text)' }}
            >
              {tools.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
            {!addingTool
              ? <button className="btn-cancel" onClick={() => setAddingTool(true)}>+ Tool</button>
              : <div style={{ display: 'flex', gap: 4 }}>
                  <input
                    placeholder="Tool name"
                    value={newToolName}
                    autoFocus
                    onChange={e => setNewToolName(e.target.value)}
                    onKeyDown={e => { if (e.key === 'Enter') handleAddTool(); if (e.key === 'Escape') setAddingTool(false) }}
                    style={{ width: 110, padding: '5px 8px', border: '1px solid var(--border)', borderRadius: 4, background: 'var(--bg-card)', fontFamily: "'Caveat', cursive", fontSize: '15px', color: 'var(--text)' }}
                  />
                  <button className="btn-save" onClick={handleAddTool}>Add</button>
                </div>
            }
          </div>
          <div className="form-actions">
            <button className="btn-save" onClick={handleAdd}>Add</button>
            <button className="btn-cancel" onClick={() => setAdding(false)}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ overflowY: 'auto', flex: 1 }}>
        {/* Favorites strip */}
        {favorites.length > 0 && selectedTool === 'all' && !search && (
          <div style={{ marginBottom: 16 }}>
            <p style={{ fontSize: '15px', color: 'var(--text-muted)', marginBottom: 6, fontFamily: "'JetBrains Mono', monospace" }}>⭐ Favourites</p>
            <div className="cards-grid">
              {favorites.map(s => (
                <ShortcutCard key={s.id} shortcut={s} onUpdate={onUpdate} onDelete={onDelete} onToggleFavorite={onToggleFavorite} onSetState={onSetState} />
              ))}
            </div>
          </div>
        )}

        {/* Grouped by tool */}
        {selectedTool === 'all' && !search ? (
          Object.entries(byTool).map(([tool, group]) => (
            <div key={tool} style={{ marginBottom: 20 }}>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                <p style={{ fontSize: '17px', fontWeight: 600, color: 'var(--text-heading)', fontFamily: "'Caveat', cursive" }}>{tool}</p>
                <button
                  onClick={() => onDeleteTool(tool)}
                  style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: '13px', color: 'var(--text-dim)', opacity: 0.5 }}
                  title={`Delete ${tool} group`}
                >🗑️</button>
              </div>
              <div className="cards-grid">
                {group.map(s => (
                  <ShortcutCard key={s.id} shortcut={s} onUpdate={onUpdate} onDelete={onDelete} onToggleFavorite={onToggleFavorite} onSetState={onSetState} />
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="cards-grid">
            {filtered.length === 0
              ? <p className="no-commands">No shortcuts found.</p>
              : filtered.map(s => (
                  <ShortcutCard key={s.id} shortcut={s} onUpdate={onUpdate} onDelete={onDelete} onToggleFavorite={onToggleFavorite} onSetState={onSetState} />
                ))
            }
          </div>
        )}
      </div>
    </main>
  )
}
