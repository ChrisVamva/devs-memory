const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform:  process.platform,
  readData:  ()       => ipcRenderer.invoke('data-read'),
  writeData: (data)   => ipcRenderer.invoke('data-write', data)
})
