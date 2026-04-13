const { app, BrowserWindow, session, ipcMain } = require('electron')
const { writeFileSync, renameSync, mkdirSync } = require('fs')
const path = require('path')
const fs   = require('fs')

const isDev = process.env.NODE_ENV === 'development' || !app.isPackaged

// ── Data file ──
const DATA_DIR  = app.getPath('userData')
const DATA_FILE = path.join(DATA_DIR, 'data.json')

function readData() {
  try {
    if (fs.existsSync(DATA_FILE)) return JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'))
  } catch {}
  return null
}

function writeData(data) {
  mkdirSync(DATA_DIR, { recursive: true })
  // Atomic write: write to temp file, then rename
  const tmpFile = DATA_FILE + '.tmp'
  writeFileSync(tmpFile, JSON.stringify(data, null, 2), 'utf8')
  renameSync(tmpFile, DATA_FILE)
  // Notify all windows of data change
  BrowserWindow.getAllWindows().forEach(win => {
    win.webContents.send('data-changed', data)
  })
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

  ipcMain.handle('data-read',  ()        => readData())
  ipcMain.handle('data-write', (_, data) => { writeData(data); return true })

  createWindow()
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) createWindow()
})
