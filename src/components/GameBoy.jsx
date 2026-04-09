import React, { useState, useEffect, useRef } from 'react'
import { createPortal } from 'react-dom'

export default function GameBoy() {
  const [open, setOpen] = useState(false)
  const [minimised, setMinimised] = useState(false)
  const [stats, setStats] = useState(null)
  const [error, setError] = useState(false)
  const intervalRef = useRef(null)

  async function fetchStats() {
    try {
      if (window.electronAPI?.getSystemStats) {
        const data = await window.electronAPI.getSystemStats()
        setStats(data)
        setError(false)
      } else {
        setError(true)
      }
    } catch (e) {
      setError(true)
    }
  }

  useEffect(() => {
    if (open) {
      fetchStats()
      intervalRef.current = setInterval(fetchStats, 1500)
    } else {
      clearInterval(intervalRef.current)
    }
    return () => clearInterval(intervalRef.current)
  }, [open])

  return (
    <>
      {/* Logo button */}
      <div
        className="ot-logo-btn"
        title="orange-tomato.com"
        onClick={async () => {
          if (window.electronAPI?.openUrl) {
            await window.electronAPI.openUrl('https://orange-tomato.com/')
          } else {
            window.open('https://orange-tomato.com/', '_blank')
          }
        }}
      >
        <img src="/ot-logo.svg" alt="Orange Tomato" />
      </div>

      {/* GitHub button */}
      <div
        className="ot-logo-btn github-btn"
        title="GitHub"
        onClick={async () => {
          if (window.electronAPI?.openUrl) {
            await window.electronAPI.openUrl('https://github.com/')
          } else {
            window.open('https://github.com/', '_blank')
          }
        }}
      >
        <img src="/github.svg" alt="GitHub" />
      </div>

      {/* Minimised pill */}
      {minimised ? (
        <div className="gb-pill" onClick={() => setMinimised(false)} title="Restore Game Boy">
          GB
        </div>
      ) : (
        /* Full widget */
        <div className="gb-widget">
          <div className="gb-widget-controls">
            <button className="gb-minimise" onClick={() => setMinimised(true)} title="Minimise">−</button>
          </div>
          <div onClick={() => setOpen(o => !o)}>
            <GBBody screenContent={
              <div className="gb-idle-screen">
                <span>SYS</span>
              </div>
            } />
          </div>
        </div>
      )}

      {/* Stats overlay */}
      {open && createPortal(
        <div className="gb-overlay" onClick={() => setOpen(false)}>
          <div className="gb-panel" onClick={e => e.stopPropagation()}>
            <GBBody screenContent={
              <div className="gb-stats-screen">
                {error ? (
                  <div className="gb-loading">no signal</div>
                ) : stats ? (
                  <>
                    <div className="gb-stat-row">
                      <span className="gb-stat-label">CPU</span>
                      <div className="gb-bar-track">
                        <div className="gb-bar-fill" style={{ width: `${stats.cpu}%`, background: barColor(stats.cpu) }} />
                      </div>
                      <span className="gb-stat-val">{stats.cpu}%</span>
                    </div>
                    <div className="gb-stat-row">
                      <span className="gb-stat-label">RAM</span>
                      <div className="gb-bar-track">
                        <div className="gb-bar-fill" style={{ width: `${stats.ramPercent}%`, background: barColor(stats.ramPercent) }} />
                      </div>
                      <span className="gb-stat-val">{stats.ramPercent}%</span>
                    </div>
                    <div className="gb-stat-detail">{stats.ramUsed} / {stats.ramTotal} MB</div>
                  </>
                ) : (
                  <div className="gb-loading">loading...</div>
                )}
              </div>
            } />
            <button className="gb-close" onClick={() => setOpen(false)}>✕</button>
          </div>
        </div>,
        document.body
      )}
    </>
  )
}

function barColor(pct) {
  if (pct < 50) return '#6aaa5a'
  if (pct < 80) return '#c8a840'
  return '#c85040'
}

function GBBody({ screenContent }) {
  return (
    <div className="gb-body">
      <div className="gb-top-bar">
        <span className="gb-power-dot" />
        <span className="gb-brand">GAME BOY</span>
      </div>
      <div className="gb-screen-bezel">
        <div className="gb-screen">{screenContent}</div>
      </div>
      <div className="gb-controls">
        <div className="gb-dpad">
          <div className="gb-dpad-h" />
          <div className="gb-dpad-v" />
          <div className="gb-dpad-center" />
        </div>
        <div className="gb-buttons">
          <div className="gb-btn gb-btn-b">B</div>
          <div className="gb-btn gb-btn-a">A</div>
        </div>
      </div>
      <div className="gb-start-select">
        <div className="gb-ss-btn">SELECT</div>
        <div className="gb-ss-btn">START</div>
      </div>
      <div className="gb-speaker">
        {[...Array(6)].map((_, i) => <div key={i} className="gb-speaker-dot" />)}
      </div>
    </div>
  )
}
