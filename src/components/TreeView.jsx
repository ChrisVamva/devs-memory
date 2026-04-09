import React, { useState, useRef, useCallback, useEffect } from 'react'

const NODE_W = 160
const NODE_H = 40
const CMD_W  = 150
const CMD_H  = 36

function useNodePositions(categories) {
  const [positions, setPositions] = useState({})

  useEffect(() => {
    setPositions(prev => {
      const next = { ...prev }
      const centerX = 340
      const startY  = 60
      const gapY     = 200

      categories.forEach((cat, i) => {
        const catKey = `cat-${cat.id}`
        if (!next[catKey]) {
          next[catKey] = { x: centerX, y: startY + i * gapY }
        }
        cat.commands.forEach((cmd, j) => {
          const cmdKey = `cmd-${cmd.id}`
          if (!next[cmdKey]) {
            const cols   = 3
            const col    = j % cols
            const row    = Math.floor(j / cols)
            const spread = 200
            const offsetX = (col - (cols - 1) / 2) * spread
            next[cmdKey] = {
              x: (next[catKey]?.x ?? centerX) + offsetX,
              y: (next[catKey]?.y ?? startY + i * gapY) + 100 + row * 80
            }
          }
        })
      })
      return next
    })
  }, [categories])

  return [positions, setPositions]
}

export default function TreeView({ categories, onCopy }) {
  const svgRef  = useRef()
  const [positions, setPositions] = useNodePositions(categories)
  const dragging = useRef(null)
  const [copied, setCopied] = useState(null)

  function handleMouseDown(e, key) {
    e.stopPropagation()
    const rect = svgRef.current.getBoundingClientRect()
    dragging.current = {
      key,
      startX: e.clientX - rect.left - (positions[key]?.x || 0),
      startY: e.clientY - rect.top  - (positions[key]?.y || 0)
    }
  }

  const handleMouseMove = useCallback(e => {
    if (!dragging.current) return
    const rect = svgRef.current.getBoundingClientRect()
    const x = e.clientX - rect.left - dragging.current.startX
    const y = e.clientY - rect.top  - dragging.current.startY
    setPositions(prev => ({ ...prev, [dragging.current.key]: { x, y } }))
  }, [])

  const handleMouseUp = useCallback(() => { dragging.current = null }, [])

  function handleCopy(value) {
    navigator.clipboard.writeText(value)
    setCopied(value)
    setTimeout(() => setCopied(null), 1500)
  }

  // Compute SVG canvas size
  const allPos = Object.values(positions)
  const maxX = Math.max(800, ...allPos.map(p => p.x + NODE_W + 40))
  const maxY = Math.max(600, ...allPos.map(p => p.y + CMD_H  + 40))

  return (
    <div
      className="tree-canvas"
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
    >
      <svg
        ref={svgRef}
        width={maxX}
        height={maxY}
        className="tree-svg"
      >
        <defs>
          <marker id="arrow" markerWidth="6" markerHeight="6" refX="3" refY="3" orient="auto">
            <path d="M0,0 L0,6 L6,3 z" fill="var(--border)" />
          </marker>
        </defs>

        {categories.map(cat => {
          const catKey = `cat-${cat.id}`
          const cp = positions[catKey]
          if (!cp) return null
          const catColor = cat.style?.color || null
          const catFont  = cat.style?.font  || "'Caveat', cursive"

          return (
            <g key={cat.id}>
              {/* Branch lines from category to commands */}
              {cat.commands.map(cmd => {
                const cmdKey = `cmd-${cmd.id}`
                const mp = positions[cmdKey]
                if (!mp) return null
                const x1 = cp.x + NODE_W / 2
                const y1 = cp.y + NODE_H
                const x2 = mp.x + CMD_W / 2
                const y2 = mp.y
                const cy1 = y1 + (y2 - y1) * 0.5
                const cy2 = y2 - (y2 - y1) * 0.5
                return (
                  <path
                    key={cmd.id}
                    d={`M${x1},${y1} C${x1},${cy1} ${x2},${cy2} ${x2},${y2}`}
                    fill="none"
                    stroke="var(--border)"
                    strokeWidth="1.5"
                    strokeDasharray="4 3"
                    opacity="0.6"
                  />
                )
              })}

              {/* Category node */}
              <g
                transform={`translate(${cp.x},${cp.y})`}
                onMouseDown={e => handleMouseDown(e, catKey)}
                style={{ cursor: 'grab' }}
              >
                <rect
                  width={NODE_W}
                  height={NODE_H}
                  rx="8"
                  fill={catColor || 'var(--bg-sidebar)'}
                  stroke={catColor ? 'transparent' : 'var(--border)'}
                  strokeWidth="1.5"
                  filter="url(#shadow)"
                />
                <text
                  x={NODE_W / 2}
                  y={NODE_H / 2 + 6}
                  textAnchor="middle"
                  fontFamily={catFont}
                  fontSize="15"
                  fontWeight="600"
                  fill={catColor ? '#1a1208' : 'var(--text-heading)'}
                >
                  {cat.name}
                </text>
              </g>

              {/* Command nodes */}
              {cat.commands.map(cmd => {
                const cmdKey = `cmd-${cmd.id}`
                const mp = positions[cmdKey]
                if (!mp) return null
                const isCopied = copied === cmd.value
                const cs = categories.find(c => c.id === cat.id)?.contentStyle || {}

                return (
                  <g
                    key={cmd.id}
                    transform={`translate(${mp.x},${mp.y})`}
                    onMouseDown={e => handleMouseDown(e, cmdKey)}
                    style={{ cursor: 'grab' }}
                  >
                    <rect
                      width={CMD_W}
                      height={CMD_H}
                      rx="6"
                      fill={cs.color ? `${cs.color}55` : 'var(--bg-card)'}
                      stroke={isCopied ? '#7a9e6a' : 'var(--border)'}
                      strokeWidth="1"
                    />
                    {/* Label */}
                    <text
                      x="8"
                      y="13"
                      fontFamily={cs.font || "'Caveat', cursive"}
                      fontSize="11"
                      fontWeight="600"
                      fill="var(--text-heading)"
                    >
                      {cmd.label}
                    </text>
                    {/* Value */}
                    <text
                      x="8"
                      y="27"
                      fontFamily="'JetBrains Mono', monospace"
                      fontSize="9"
                      fill="var(--text-code)"
                    >
                      {cmd.value.length > 20 ? cmd.value.slice(0, 20) + '…' : cmd.value}
                    </text>
                    {/* Copy button */}
                    <g
                      transform={`translate(${CMD_W - 28}, 8)`}
                      onClick={() => handleCopy(cmd.value)}
                      style={{ cursor: 'pointer' }}
                    >
                      <rect width="22" height="20" rx="4" fill={isCopied ? '#c8e6c0' : 'var(--accent-light)'} />
                      <text
                        x="11" y="14"
                        textAnchor="middle"
                        fontSize="9"
                        fontFamily="'JetBrains Mono', monospace"
                        fill={isCopied ? '#4a7a3a' : 'var(--accent)'}
                      >
                        {isCopied ? '✓' : '⎘'}
                      </text>
                    </g>
                  </g>
                )
              })}
            </g>
          )
        })}

        {/* Drop shadow filter */}
        <defs>
          <filter id="shadow" x="-10%" y="-10%" width="120%" height="130%">
            <feDropShadow dx="1" dy="2" stdDeviation="2" floodOpacity="0.1" />
          </filter>
        </defs>
      </svg>
    </div>
  )
}
