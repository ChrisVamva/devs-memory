import React, { useState } from 'react'
import { KeyCombo } from './Keycap'

const STATES = ['new', 'learning', 'known', 'mastered']
const STATE_COLORS = {
  new:      { bg: '#e8d4b8', text: '#7a5c3a' },
  learning: { bg: '#e8d4c4', text: '#7a4a2a' },
  known:    { bg: '#c4d8c4', text: '#2a5a2a' },
  mastered: { bg: '#c4d4e8', text: '#2a3a7a' },
}

export default function ShortcutCard({ shortcut, onUpdate, onDelete, onToggleFavorite, onSetState }) {
  const [editing, setEditing] = useState(false)
  const [keys, setKeys] = useState(shortcut.keys.join(' + '))
  const [action, setAction] = useState(shortcut.action)

  const sc = STATE_COLORS[shortcut.state] || STATE_COLORS.new

  function handleSave() {
    const parsedKeys = keys.split('+').map(k => k.trim()).filter(Boolean)
    onUpdate(shortcut.id, { keys: parsedKeys, action })
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="command-card editing">
        <input
          className="card-label-input"
          value={action}
          onChange={e => setAction(e.target.value)}
          placeholder="Action description"
          autoFocus
        />
        <input
          className="card-label-input"
          value={keys}
          onChange={e => setKeys(e.target.value)}
          placeholder="Keys e.g. Ctrl + Shift + P"
          style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px' }}
        />
        <div className="card-edit-actions">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-cancel" onClick={() => setEditing(false)}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="command-card shortcut-card">
      <div className="card-header">
        <span className="card-label">{shortcut.action}</span>
        <div className="card-actions">
          <button
            title="Favourite"
            onClick={() => onToggleFavorite(shortcut.id)}
            style={{ opacity: shortcut.favorite ? 1 : undefined }}
          >
            {shortcut.favorite ? '⭐' : '☆'}
          </button>
          <button title="Edit" onClick={() => setEditing(true)}>✏️</button>
          <button title="Delete" onClick={() => onDelete(shortcut.id)}>🗑️</button>
        </div>
      </div>

      <div style={{ margin: '6px 0' }}>
        <KeyCombo keys={shortcut.keys} />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 4 }}>
        <select
          className="shortcut-state-select"
          value={shortcut.state}
          onChange={e => onSetState(shortcut.id, e.target.value)}
          style={{ background: sc.bg, color: sc.text }}
        >
          {STATES.map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
        <span style={{
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: '12px',
          color: 'var(--text-muted)',
          background: 'var(--bg-code)',
          padding: '1px 6px',
          borderRadius: '4px',
        }}>{shortcut.tool}</span>
      </div>
    </div>
  )
}
