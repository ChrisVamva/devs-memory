const { contextBridge } = require('electron')

// Expose safe APIs to renderer here as needed
contextBridge.exposeInMainWorld('electronAPI', {
  platform: process.platform
})
