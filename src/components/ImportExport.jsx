import React, { useRef } from 'react'
import { createPortal } from 'react-dom'

export default function ImportExport({ categories, onImport, onClose }) {
  const fileRef = useRef()

  function handleExport() {
    const json = JSON.stringify(categories, null, 2)
    const blob = new Blob([json], { type: 'application/json' })
    const url  = URL.createObjectURL(blob)
    const a    = document.createElement('a')
    a.href     = url
    a.download = 'devs-memory-export.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  function handleImport(e) {
    const file = e.target.files[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = ev => {
      try {
        const data = JSON.parse(ev.target.result)
        if (Array.isArray(data)) { onImport(data); onClose() }
        else alert('Invalid format — expected a JSON array of categories.')
      } catch { alert('Could not parse JSON file.') }
    }
    reader.readAsText(file)
  }

  return createPortal(
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <h3 className="modal-title">Import / Export</h3>

        <div className="ie-section">
          <p className="ie-desc">Export all your categories and commands to a JSON file.</p>
          <button className="btn-save" onClick={handleExport}>⬇ Export JSON</button>
        </div>

        <div className="ie-divider" />

        <div className="ie-section">
          <p className="ie-desc">Import from a previously exported JSON file. This will merge with your existing data.</p>
          <button className="btn-save" onClick={() => fileRef.current.click()}>⬆ Import JSON</button>
          <input ref={fileRef} type="file" accept=".json" style={{ display: 'none' }} onChange={handleImport} />
        </div>

        <div className="modal-actions" style={{ marginTop: 8 }}>
          <button className="btn-cancel" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  )
}
