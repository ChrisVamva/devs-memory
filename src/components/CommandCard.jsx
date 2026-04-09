import React, { useState } from 'react'

export default function CommandCard({ command, categoryId, contentStyle = {}, onUpdate, onDelete }) {
  const [copied, setCopied] = useState(false)
  const [editing, setEditing] = useState(false)
  const [label, setLabel] = useState(command.label)
  const [value, setValue] = useState(command.value)

  function handleCopy() {
    navigator.clipboard.writeText(command.value)
    setCopied(true)
    setTimeout(() => setCopied(false), 1500)
  }

  function handleSave() {
    if (label.trim() && value.trim()) {
      onUpdate(categoryId, command.id, label.trim(), value.trim())
      setEditing(false)
    }
  }

  function handleCancel() {
    setLabel(command.label)
    setValue(command.value)
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="command-card editing">
        <input
          className="card-label-input"
          value={label}
          onChange={e => setLabel(e.target.value)}
          placeholder="Label"
        />
        <textarea
          className="card-value-input"
          value={value}
          onChange={e => setValue(e.target.value)}
          placeholder="Command"
          rows={3}
        />
        <div className="card-edit-actions">
          <button className="btn-save" onClick={handleSave}>Save</button>
          <button className="btn-cancel" onClick={handleCancel}>Cancel</button>
        </div>
      </div>
    )
  }

  return (
    <div className="command-card" style={{
      borderColor: contentStyle.color || undefined,
      background: contentStyle.color ? `${contentStyle.color}33` : undefined
    }}>
      <div className="card-header">
        <span className="card-label" style={{ fontFamily: contentStyle.font || undefined }}>{command.label}</span>
        <div className="card-actions">
          <button title="Edit" onClick={() => setEditing(true)}>✏️</button>
          <button title="Delete" onClick={() => onDelete(categoryId, command.id)}>🗑️</button>
        </div>
      </div>
      <code className="card-value">{command.value}</code>
      <button className={`copy-btn ${copied ? 'copied' : ''}`} onClick={handleCopy}>
        {copied ? '✓ Copied' : 'Copy'}
      </button>
    </div>
  )
}
