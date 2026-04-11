const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronSpotlight', {
  close: () => ipcRenderer.send('spotlight-close')
})

ipcRenderer.on('spotlight-data', (_, commands) => {
  window.postMessage({ type: 'data', commands }, '*')
})
