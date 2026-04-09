const { contextBridge, ipcRenderer } = require('electron')

contextBridge.exposeInMainWorld('electronAPI', {
  platform:       process.platform,
  getSystemStats: ()       => ipcRenderer.invoke('get-system-stats'),
  openUrl:        (url)    => ipcRenderer.invoke('open-url', url),
  readData:       ()       => ipcRenderer.invoke('data-read'),
  writeData:      (data)   => ipcRenderer.invoke('data-write', data),
  getDataPath:    ()       => ipcRenderer.invoke('data-path'),
  onDataChanged:  (cb)     => ipcRenderer.on('data-changed', (_, data) => cb(data))
})
