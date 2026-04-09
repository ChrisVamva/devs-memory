const { app, BrowserWindow, session, ipcMain, shell } = require('electron')
const path = require('path')
const fs = require('fs')
const os = require('os')
const si = require('systeminformation')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// ── Data file path ──
const DATA_DIR  = app.getPath('userData')
const DATA_FILE = path.join(DATA_DIR, 'data.json')

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {}
  return null
}

function writeData(data) {
  fs.mkdirSync(DATA_DIR, { recursive: true })
  fs.writeFileSync(DATA_FILE, JSON.stringify(data, null, 2), 'utf8')
}

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

  win.webContents.once('did-finish-load', () => startWatcher(win))
}

app.whenReady().then(() => {
  session.defaultSession.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self' 'unsafe-inline' https://fonts.googleapis.com https://fonts.gstatic.com; font-src 'self' https://fonts.gstatic.com data:; connect-src 'self'"
        ]
      }
    })
  })

  // Block navigation inside the window, open externally instead
  app.on('web-contents-created', (_, contents) => {
    contents.setWindowOpenHandler(({ url }) => {
      shell.openExternal(url)
      return { action: 'deny' }
    })
  })

  ipcMain.handle('open-url', (_, url) => {
    return shell.openExternal(url)
  })

  // ── Data IPC ──
  ipcMain.handle('data-read', () => readData())
  ipcMain.handle('data-write', (_, data) => { writeData(data); return true })
  ipcMain.handle('data-path', () => DATA_FILE)

  // ── File watcher — push external changes (MCP) to renderer ──
  let watcher = null
  function startWatcher(win) {
    if (watcher) return
    fs.mkdirSync(DATA_DIR, { recursive: true })
    if (!fs.existsSync(DATA_FILE)) writeData([])
    watcher = fs.watch(DATA_FILE, () => {
      const data = readData()
      if (data) win.webContents.send('data-changed', data)
    })
  }

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
