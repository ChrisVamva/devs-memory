import React, { useState } from 'react'
import { createPortal } from 'react-dom'

export default function NoteModal({ category, onSave, onClose }) {
  const [text, setText] = useState(category.note || '')
  const accentColor = category.style?.color || null

  function handleSave() {
    onSave(category.id, text)
    onClose()
  }

  const paperStyle = accentColor ? {
    background: `linear-gradient(to bottom right, ${accentColor}55, #faf7f0 60%)`,
    borderColor: accentColor,
  } : {}

  const ringColor = accentColor || '#3d2e1a'

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="notebook-modal" onClick={e => e.stopPropagation()} style={paperStyle}>

        {/* Spiral rings */}
        <div className="notebook-rings">
          {[...Array(9)].map((_, i) => (
            <div key={i} className="ring" style={{ borderColor: ringColor }} />
          ))}
        </div>

        {/* Header */}
        <div className="notebook-header">
          <span
            className="notebook-title"
            style={{
              fontFamily: category.style?.font || "'Caveat', cursive",
              color: accentColor ? darken(accentColor) : '#5a3e1b'
            }}
          >
            {category.name}
          </span>
          <button className="gb-close" onClick={onClose}>✕</button>
        </div>

        {/* Lined paper textarea */}
        <div className="notebook-paper">
          <textarea
            className="notebook-textarea"
            value={text}
            onChange={e => setText(e.target.value)}
            placeholder={`Notes about ${category.name}...`}
            autoFocus
            style={{ fontFamily: category.style?.font || "'Caveat', cursive" }}
          />
        </div>

        <div className="notebook-footer">
          <button className="btn-save" onClick={handleSave}>Save note</button>
          <button className="btn-cancel" onClick={onClose}>Cancel</button>
        </div>
      </div>
    </div>,
    document.body
  )
}

// Darken a hex color for text contrast
function darken(hex) {
  const n = parseInt(hex.slice(1), 16)
  const r = Math.max(0, (n >> 16) - 60)
  const g = Math.max(0, ((n >> 8) & 0xff) - 60)
  const b = Math.max(0, (n & 0xff) - 60)
  return `rgb(${r},${g},${b})`
}
