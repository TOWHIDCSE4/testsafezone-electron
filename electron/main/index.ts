import { app, ipcMain, Notification } from 'electron'
import { electronApp, is, optimizer } from '@electron-toolkit/utils'
import { DataSourceReady } from './helpers/data-source'
import startService from './helpers/start-service'
import { allHandle } from './helpers/ipc-handle'
import Setting from './helpers/setting'
import { getMainWindow} from './helpers/windows'
import { join } from 'path'
import { proxyDisable } from './helpers/proxy'
import { autoUpdater } from 'electron-updater'
import pathUserData from './helpers/path-user-data'
import {isWindows} from "./helpers/platform";
import {initRunAsAdmin} from "./helpers/powershell";
import { writeLog } from './helpers/log'
// import bcrypt from 'bcrypt'

const showMainWindow = async (step = 'welcome') => {
  const mainWindow = await getMainWindow()
  mainWindow.show()
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    await mainWindow.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#${step}`)
    mainWindow.webContents.openDevTools()
  } else {
    await mainWindow.loadFile(join(__dirname, '../renderer/index.html'), { hash: step })
  }
}

;(async () => {
  await app.whenReady()

  console.log(pathUserData)

  //Check ứng dụng đã chạy chưa
  if (!app.requestSingleInstanceLock()) {
    new Notification({
      title: 'SafeZone',
      body: 'Ứng dụng đang chạy !'
    }).show()
    app.quit()
  }

  if (isWindows) {
    await initRunAsAdmin()
  }

  //Autoupdate
  autoUpdater.on('update-available', (info) => {
    new Notification({
      title: 'SafeZone',
      body: `Đã có phiên bản mới nhất v${info.version}! Đang tải về.`
    }).show()
  })

  autoUpdater.on('update-downloaded', (info) => {
    new Notification({
      title: 'SafeZone',
      body: `Đã tải xong phiên bản mới nhất v${info.version}!`
    }).show()
    setTimeout(() => {
      autoUpdater.quitAndInstall(true, true)
    }, 1000)
  })

  //Check update khi run app
  autoUpdater.checkForUpdates()
  //Check update mỗi 2h
  setInterval(() => {
    autoUpdater.checkForUpdates()
  }, 1000 * 60 * 60 * 2)

  //
  electronApp.setAppUserModelId('vn.com.safezone')

  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  //Đợi local data sẵn sàng
  await DataSourceReady()

  //Event all ipc
  allHandle()

  if ((await Setting.get('USER_ID')) === null) {
    //Màn bắt đầu
    await showMainWindow()
  } else if ((await Setting.get('DEVICES_ID')) === null) {
    //Thêm thiết bị
    await showMainWindow('device')
  } else if ((await Setting.get('PIN')) === null) {
    //Done set Pin
    await showMainWindow('done')
  } else {
    //Run Service
    await startService()
  }
})()

app.on('window-all-closed', () => {
  // if (process.platform !== 'darwin') {
  //   app.quit()
  // }
  // not kill app when close all windows
})

app.on('before-quit', () => {
  writeLog("before-quit", "app-main")
  proxyDisable()
  ipcMain.removeAllListeners()
})
