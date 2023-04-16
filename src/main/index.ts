import { app, shell, BrowserWindow, session, ipcMain } from 'electron'
import * as path from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import { join } from 'path'
import { homedir } from 'os'
//关闭控制台警告
process.env['ELECTRON_DISABLE_SECURITY_WARNINGS'] = 'true'
let mainWindow: BrowserWindow
const gotTheLock = app.requestSingleInstanceLock()
function createWindow(): void {
  // Create the browser window.
  mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    // show: false,
    frame: false, // 去掉默认的标题栏
    autoHideMenuBar: true,
    ...(process.platform === 'linux'
      ? {
          icon: path.join(__dirname, '../../build/icon.png')
        }
      : {}),
    webPreferences: {
      preload: path.join(__dirname, '../preload/index.js'),
      sandbox: false,
      nodeIntegration: true,
      // 官网似乎说是默认false，但是这里必须设置contextIsolation
      contextIsolation: false,
      nodeIntegrationInWorker: true
    }
  })
  // mainWindow.show()

  mainWindow.on('ready-to-show', () => {})

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'))
  }
  mainWindow.on('maximize', () => {
    mainWindow.webContents.send('mainWindowCharge', 'maximize')
  })

  mainWindow.on('unmaximize', () => {
    mainWindow.webContents.send('mainWindowCharge', 'unmaximize')
  })
  ipcMain.on('close-app', () => {
    if (mainWindow) {
      mainWindow.close()
    }
  })
  ipcMain.on('min-app', () => {
    mainWindow.minimize()
  })
  ipcMain.on('max-app', () => {
    mainWindow.maximize()
  })
  ipcMain.on('unmax-app', () => {
    mainWindow.unmaximize()
  })
  ipcMain.on('open-console', () => {
    mainWindow.webContents.openDevTools()
  })
}

const reactDevToolsPath = join(
  homedir(),
  'AppData/Local/Microsoft/Edge/User Data/Default/Extensions/olofadcdnkkjdfgjcmjaadnlehnnihnl/6.5.0_0'
)
if (!gotTheLock) {
  app.quit()
} else {
  app.on('second-instance', (_event, _commandLine, _workingDirectory, additionalData) => {
    // 输出从第二个实例中接收到的数据
    console.log(additionalData)

    // 有人试图运行第二个实例，我们应该关注我们的窗口
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }
  })

  // This method will be called when Electron has finished
  // initialization and is ready to create browser windows.
  // Some APIs can only be used after this event occurs.
  app.whenReady().then(async () => {
    // Set app user model id for windows
    electronApp.setAppUserModelId('com.electron')

    // Default open or close DevTools by F12 in development
    // and ignore CommandOrControl + R in production.
    // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
    app.on('browser-window-created', (_, window) => {
      optimizer.watchWindowShortcuts(window)
    })

    createWindow()
    if (is.dev) {
      await session.defaultSession.loadExtension(reactDevToolsPath)
    }
    app.on('activate', function () {
      // On macOS it's common to re-create a window in the app when the
      // dock icon is clicked and there are no other windows open.
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  })

  // Quit when all windows are closed, except on macOS. There, it's common
  // for applications and their menu bar to stay active until the user quits
  // explicitly with Cmd + Q.
  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })
}

// In this file you can include the rest of your app"s specific main process
// code. You can also put them in separate files and require them here.
