import React, { useState, useRef, useEffect } from 'react'

const COLORS = [
  { label: 'None', value: null },
  { label: 'Rose', value: '#e8c4c4' },
  { label: 'Peach', value: '#e8d4b8' },
  { label: 'Sage', value: '#c4d8c4' },
  { label: 'Sky', value: '#c4d4e8' },
  { label: 'Lavender', value: '#d4c4e8' },
  { label: 'Sand', value: '#e0d8c0' },
  { label: 'Ink', value: '#c8c8d8' },
]

const FONTS = [
  { label: 'Caveat', value: "'Caveat', cursive" },
  { label: 'Serif', value: "'Georgia', serif" },
  { label: 'Mono', value: "'JetBrains Mono', monospace" },
  { label: 'Sans', value: "system-ui, sans-serif" },
]

export default function StylePicker({ category, onApply, onClose }) {
  const [color, setColor] = useState(category.style?.color || null)
  const [font, setFont] = useState(category.style?.font || FONTS[0].value)
  const [showConfirm, setShowConfirm] = useState(false)
  const ref = useRef()

  useEffect(() => {
    function handleClick(e) {
      if (ref.current && !ref.current.contains(e.target)) onClose()
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [onClose])

  function handleApply() {
    setShowConfirm(true)
  }

  function handleConfirm(applyToContents) {
    onApply({ color, font }, applyToContents)
    onClose()
  }

  if (showConfirm) {
    return (
      <div className="style-picker confirm-modal" ref={ref}>
        <p className="confirm-text">Apply color & font to all cards in this category too?</p>
        <div className="confirm-actions">
          <button className="btn-confirm-yes" onClick={() => handleConfirm(true)}>Yes, apply all</button>
          <button className="btn-confirm-no" onClick={() => handleConfirm(false)}>Title only</button>
        </div>
      </div>
    )
  }

  return (
    <div className="style-picker" ref={ref}>
      <p className="picker-label">Color tag</p>
      <div className="color-swatches">
        {COLORS.map(c => (
          <button
            key={c.label}
            title={c.label}
            className={`swatch ${color === c.value ? 'selected' : ''}`}
            style={{ background: c.value || 'transparent', border: c.value ? `2px solid ${c.value}` : '2px dashed #b0a090' }}
            onClick={() => setColor(c.value)}
          />
        ))}
      </div>

      <p className="picker-label" style={{ marginTop: 10 }}>Typography</p>
      <div className="font-options">
        {FONTS.map(f => (
          <button
            key={f.label}
            className={`font-option ${font === f.value ? 'selected' : ''}`}
            style={{ fontFamily: f.value }}
            onClick={() => setFont(f.value)}
          >
            {f.label}
          </button>
        ))}
      </div>

      <button className="btn-apply" onClick={handleApply}>Apply</button>
    </div>
  )
}
