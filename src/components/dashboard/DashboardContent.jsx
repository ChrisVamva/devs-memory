import React from 'react';
import { SHORTCUTS } from './shortcuts-data';

export function DashboardContent() {
  return (
    <div className="dashboard-section p-6">
      <header className="flex items-center justify-between mb-6 border-b border-border pb-4">
        <div>
          <h1 className="text-xl font-semibold text-text-heading">Shortcut Dashboard</h1>
          <p className="text-sm text-text-muted">Quick reference for system leverage</p>
        </div>
        <div className="text-xs bg-accent-light px-2 py-1 rounded text-text-code">
          {SHORTCUTS.length} Active
        </div>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {SHORTCUTS.map(shortcut => (
          <div key={shortcut.id} className="dash-card">
            <div className="dash-label">{shortcut.label}</div>
            <div className="dash-value">{shortcut.value}</div>
            <div className="flex justify-between items-center mt-2">
              <span className="text-[11px] text-text-dim uppercase">{shortcut.leverage} leverage</span>
              <span className="text-[11px] px-1.5 py-0.5 rounded bg-border-soft text-text-muted">{shortcut.state}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
