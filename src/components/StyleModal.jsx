import React, { useState } from 'react'
import { createPortal } from 'react-dom'

const COLORS = [
  { label: 'None',     value: null },
  { label: 'Rose',     value: '#e8c4c4' },
  { label: 'Peach',    value: '#e8d4b8' },
  { label: 'Sage',     value: '#c4d8c4' },
  { label: 'Sky',      value: '#c4d4e8' },
  { label: 'Lavender', value: '#d4c4e8' },
  { label: 'Sand',     value: '#e0d8c0' },
  { label: 'Ink',      value: '#c8c8d8' },
]

const FONTS = [
  { label: 'Handwritten', value: "'Caveat', cursive" },
  { label: 'Serif',       value: "'Georgia', serif" },
  { label: 'Mono',        value: "'JetBrains Mono', monospace" },
  { label: 'Sans',        value: "system-ui, sans-serif" },
]

export default function StyleModal({ category, onApply, onClose }) {
  const [color, setColor] = useState(category.style?.color || null)
  const [font,  setFont]  = useState(category.style?.font  || FONTS[0].value)
  const [step,  setStep]  = useState('edit') // 'edit' | 'confirm'

  function handleSave() {
    setStep('confirm')
  }

  function handleConfirm(applyToContents) {
    onApply({ color, font }, applyToContents)
    onClose()
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>

        {step === 'edit' && (
          <>
            <h3 className="modal-title">Customise "{category.name}"</h3>

            {/* Live preview */}
            <div className="modal-preview">
              <span
                className="preview-tag"
                style={{
                  fontFamily: font,
                  background: color || 'transparent',
                  border: color ? 'none' : '1px dashed #b0a090',
                  borderRadius: '6px',
                  padding: '4px 14px',
                  fontSize: '20px',
                  color: '#3d2e1a',
                }}
              >
                {category.name}
              </span>
            </div>

            {/* Color */}
            <p className="modal-label">Color tag</p>
            <div className="color-swatches">
              {COLORS.map(c => (
                <button
                  key={c.label}
                  title={c.label}
                  className={`swatch ${color === c.value ? 'selected' : ''}`}
                  style={{
                    background: c.value || 'transparent',
                    border: c.value ? `2px solid ${c.value}` : '2px dashed #b0a090',
                  }}
                  onClick={() => setColor(c.value)}
                />
              ))}
            </div>

            {/* Font */}
            <p className="modal-label" style={{ marginTop: 16 }}>Typography</p>
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

            <div className="modal-actions">
              <button className="btn-save" onClick={handleSave}>Save</button>
              <button className="btn-cancel" onClick={onClose}>Cancel</button>
            </div>
          </>
        )}

        {step === 'confirm' && (
          <>
            <h3 className="modal-title">Apply to contents?</h3>
            <p className="confirm-text">
              Do you want to apply this color and font to all command cards inside "{category.name}" as well?
            </p>
            <div className="modal-actions column">
              <button className="btn-save" onClick={() => handleConfirm(true)}>Yes, apply to all cards</button>
              <button className="btn-cancel" onClick={() => handleConfirm(false)}>Title only</button>
            </div>
          </>
        )}

      </div>
    </div>
  , document.body)
}
