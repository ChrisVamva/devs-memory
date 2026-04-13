const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform:  process.platform,
  readData:  ()       => ipcRenderer.invoke('data-read'),
  writeData: (data)   => ipcRenderer.invoke('data-write', data),
  onDataChanged: (cb)   => ipcRenderer.on('data-changed', (_, data) => cb(data)),
  offDataChanged: (cb) => ipcRenderer.removeListener('data-changed', cb)
})
