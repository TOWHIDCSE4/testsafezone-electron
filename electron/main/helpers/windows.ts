import {app, ipcMain, nativeImage} from 'electron'
import { icon32 } from './resources'
import { is } from '@electron-toolkit/utils'
import { join } from 'path'
import createWindow from './create-window'
import {checkPinHandle} from "./ipc-handle";

let windows: any = {
  main: undefined,
  lock: undefined,
  pin: undefined,
  login: undefined
}

export const getMainWindow = async () => {
  await app.whenReady()

  if (windows.main === undefined) {
    windows.main = createWindow('main', {
      width: 900,
      height: 500,
      autoHideMenuBar: true,
      resizable: false,
      maximizable: false,
      minimizable: false,
      show: false
    })

    windows.main.setIcon(nativeImage.createFromDataURL(icon32))
  }

  return windows.main
}

export const getLoginWindow = async () => {
  await app.whenReady()

  if (windows.login === undefined) {
    windows.login = createWindow('login', {
      width: 400,
      height: 450,
      autoHideMenuBar: true,
      resizable: false,
      maximizable: false,
      minimizable: false,
      show: false
    })

    windows.login.setIcon(nativeImage.createFromDataURL(icon32))
  }

  return windows.login
}

export const getLockWindow = async () => {
  await app.whenReady()

  if (windows.lock === undefined) {
    windows.lock = createWindow('lock', {
      // transparent: true,
      fullscreen: true, // remove if you don't need a fullscreen window
      // focusable: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      frame: false,
      show: false
    })

    windows.lock.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    windows.lock.setAlwaysOnTop(true, 'screen-saver', 2)

    windows.lock.on('show', () => {
      checkPinHandle()
    })

    windows.lock.on('hide', () => {
      ipcMain.removeHandler('checkPin')
    })

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await windows.lock.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#lock`)
      windows.lock.webContents.openDevTools()
    } else {
      await windows.lock.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'lock' })
    }
  }

  return windows.lock
}

export const getPinWindow = async () => {
  await app.whenReady()

  if (windows.pin === undefined) {
    windows.pin = createWindow('pin', {
      width: 390,
      height: 250,
      frame: false,
      skipTaskbar: true,
      alwaysOnTop: true,
      resizable: false,
      show: false
    })

    windows.pin.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
    windows.pin.setAlwaysOnTop(true, 'screen-saver', 1)

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      await windows.pin.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#pin`)
      windows.pin.webContents.openDevTools()
    } else {
      await windows.pin.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'pin' })
    }
  }
  
  return windows.pin
}

export const getChangePinWindows = async (foreNew = false) => {
  await app.whenReady()

  // if (windows.changePIN === undefined) {
    if (foreNew) {
      windows.changePIN = createWindow('change-pin', {
        width: 500,
        height: 400,
        frame: false,
        // skipTaskbar: true,
        alwaysOnTop: true,
        resizable: true,
        show: true
      })
  
      windows.changePIN.setVisibleOnAllWorkspaces(true, { visibleOnFullScreen: true })
      // windows.changePIN.setAlwaysOnTop(true, 'screen-saver', 1)
  
      if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
        await windows.changePIN.loadURL(`${process.env['ELECTRON_RENDERER_URL']}#change-pin`)
        windows.changePIN.webContents.openDevTools()
      } else {
        await windows.changePIN.loadFile(join(__dirname, '../renderer/index.html'), { hash: 'change-pin' })
      }
    }
    
  // }
  
  return windows.changePIN
}
