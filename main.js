const { app, BrowserWindow, session, ipcMain } = require('electron')
const path = require('path')
const os = require('os')
const si = require('systeminformation')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

function createWindow() {
  const win = new BrowserWindow({
    width: 720,
    height: 540,
    minWidth: 520,
    minHeight: 400,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    titleBarStyle: 'hidden',
    title: "Dev's Memory",
    backgroundColor: '#f5f0e8'
  })

  if (isDev) {
    win.loadURL('http://localhost:5173')
  } else {
    win.loadFile(path.join(__dirname, 'dist', 'index.html'))
  }
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': ["default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com data:"]
      }
    })
  })

  ipcMain.handle('get-system-stats', async () => {
    const totalMem = os.totalmem()
    const freeMem  = os.freemem()
    const usedMem  = totalMem - freeMem
    const cpu = await si.currentLoad()
    return {
      cpu: Math.round(cpu.currentLoad),
      ramUsed: Math.round(usedMem / 1024 / 1024),
      ramTotal: Math.round(totalMem / 1024 / 1024),
      ramPercent: Math.round((usedMem / totalMem) * 100)
    }
  })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
