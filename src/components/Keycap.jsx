import React from 'react'

const KEY_SYMBOLS = {
  'Ctrl': '⌃', 'Cmd': '⌘', 'Alt': '⌥', 'Shift': '⇧',
  'Enter': '↵', 'Tab': '⇥', 'Backspace': '⌫', 'Delete': '⌦',
  'Escape': '⎋', 'Space': '␣', 'Up': '↑', 'Down': '↓', 'Left': '←', 'Right': '→',
}

export function Keycap({ label, size = 'md' }) {
  const display = KEY_SYMBOLS[label] || label
  const sizes = {
    sm: { fontSize: '10px', padding: '1px 5px', minWidth: '18px', height: '18px' },
    md: { fontSize: '12px', padding: '2px 7px', minWidth: '22px', height: '22px' },
    lg: { fontSize: '14px', padding: '3px 10px', minWidth: '28px', height: '28px' },
  }
  return (
    <span style={{
      ...sizes[size],
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: "'JetBrains Mono', monospace",
      fontWeight: 500,
      background: 'var(--bg-card)',
      border: '1px solid var(--border)',
      borderBottom: '2px solid var(--border)',
      borderRadius: '4px',
      color: 'var(--text-code)',
      boxShadow: '0 1px 2px rgba(0,0,0,0.08)',
      userSelect: 'none',
    }}>
      {display}
    </span>
  )
}

export function KeyCombo({ keys, size = 'md' }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: '3px' }}>
      {keys.map((k, i) => (
        <React.Fragment key={i}>
          <Keycap label={k} size={size} />
          {i < keys.length - 1 && (
            <span style={{ fontSize: '10px', color: 'var(--text-dim)', fontFamily: 'monospace' }}>+</span>
          )}
        </React.Fragment>
      ))}
    </span>
  )
}
