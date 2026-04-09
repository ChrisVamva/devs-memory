const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform,
  getSystemStats: () => ipcRenderer.invoke('get-system-stats')
})
