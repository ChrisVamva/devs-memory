import React, { useState } from 'react'
import CommandCard from './CommandCard'

export default function CommandList({ category, onAdd, onUpdate, onDelete, onApprove, onAddSubcategory, onDeleteSubcategory }) {
  const [addingTo, setAddingTo] = useState(null)
  const [addingSubRef, setAddingSubRef] = useState(false)
  const [label, setLabel] = useState('')
  const [value, setValue] = useState('')
  const [subName, setSubName] = useState('')

  function handleAdd() {
    if (label.trim() && value.trim()) {
      onAdd(category.id, label.trim(), value.trim(), addingTo === '_default' ? undefined : addingTo)
      setLabel('')
      setValue('')
      setAddingTo(null)
    }
  }

  function handleAddSubcategory() {
    if (subName.trim()) {
      onAddSubcategory(category.id, subName.trim())
      setSubName('')
      setAddingSubRef(false)
    }
  }

  if (!category) {
    return (
      <main className="command-list empty-state">
        <p>Select a category from the sidebar</p>
      </main>
    )
  }

  const subcategories = category.subcategories || []
  const grouped = { _default: [] }
  subcategories.forEach(sub => grouped[sub] = [])
  category.commands.forEach(cmd => {
    const s = cmd.subcategory
    if (s && grouped[s]) {
      grouped[s].push(cmd)
    } else {
      grouped._default.push(cmd)
    }
  })

  // Which sections to render: if there are no subcategories, just render '_default'
  const sections = subcategories.length > 0
    ? ['_default', ...subcategories].filter(sub => sub !== '_default' || grouped[sub].length > 0 || addingTo === '_default')
    : ['_default']

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
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="add-command-btn" onClick={() => setAddingSubRef(true)}>+ Add Side Category</button>
          {subcategories.length === 0 && (
            <button className="add-command-btn" onClick={() => setAddingTo('_default')}>+ Add Command</button>
          )}
        </div>
      </div>

      {addingSubRef && (
        <div className="add-command-form">
          <input
            placeholder="Side Category Name (e.g. Branching)"
            value={subName}
            autoFocus
            onChange={e => setSubName(e.target.value)}
          />
          <div className="form-actions">
            <button className="btn-save" onClick={handleAddSubcategory}>Add</button>
            <button className="btn-cancel" onClick={() => { setAddingSubRef(false); setSubName('') }}>Cancel</button>
          </div>
        </div>
      )}

      <div style={{ flex: 1, overflowY: 'auto' }}>
        {sections.map(sub => (
          <div key={sub} style={{ marginBottom: sections.length > 1 ? '24px' : '0' }}>
            {sections.length > 1 && (
              <div style={{ display: 'flex', alignItems: 'center', justifyItems: 'center', justifyContent: 'space-between', marginBottom: '12px', borderBottom: '1px solid var(--border)', paddingBottom: '4px' }}>
                <h3 style={{ fontSize: '18px', color: 'var(--text-heading)' }}>
                  {sub === '_default' ? 'General' : sub}
                </h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button className="add-command-btn" style={{ padding: '2px 8px', fontSize: '12px' }} onClick={() => setAddingTo(sub)}>+ Add</button>
                  {sub !== '_default' && (
                    <button title="Delete Category" onClick={() => onDeleteSubcategory(category.id, sub)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}>🗑️</button>
                  )}
                </div>
              </div>
            )}

            {addingTo === sub && (
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
                  <button className="btn-cancel" onClick={() => { setAddingTo(null); setLabel(''); setValue('') }}>Cancel</button>
                </div>
              </div>
            )}

            <div className="cards-grid" style={{ overflowY: 'visible', paddingBottom: '4px' }}>
              {grouped[sub].length === 0 && addingTo !== sub && sections.length === 1 && (
                <p className="no-commands">No commands yet. Hit "+ Add Command" to start.</p>
              )}
              {grouped[sub].length === 0 && addingTo !== sub && sections.length > 1 && (
                <p className="no-commands" style={{ paddingTop: '0', gridColumn: '1 / -1', opacity: 0.5 }}>No commands in this category.</p>
              )}
              {grouped[sub].map(cmd => (
                <CommandCard
                  key={cmd.id}
                  command={cmd}
                  categoryId={category.id}
                  contentStyle={category.contentStyle || {}}
                  onUpdate={onUpdate}
                  onDelete={onDelete}
                  onApprove={onApprove}
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </main>
  )
}
