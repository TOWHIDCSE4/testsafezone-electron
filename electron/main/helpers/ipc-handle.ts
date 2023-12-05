import { app, ipcMain, dialog, nativeImage, shell } from 'electron'
import { apiGet, apiPost } from './api'
import Setting from './setting'
import { machineId } from 'node-machine-id'
import os from 'os'
import { isWindows } from './platform'
import { getChangePinWindows, getMainWindow, getPinWindow } from './windows'
import { startSleep } from './power'
import { is } from '@electron-toolkit/utils'
import { icon16, icon32 } from './resources'
import startService from './start-service'
import bcrypt from 'bcrypt'
import sleep from './sleep'
import { unlockRestrictScreen } from './worker'
import { pauseSafeZone } from './show-tray'
let pinPassed

const loginHandle = () => {
  // @ts-ignore
  ipcMain.handle('login', async (event, args) => {
    const res = await apiPost('auth/login', args)
    if (res && !res.error) {
      await Setting.set({
        USER_ID: res.user.UserAttributes.find((item: any) => item.Name === 'sub').Value,
        USER_NAME: res.user.Username,
        ACCESS_TOKEN: res.authResult.AuthenticationResult.AccessToken,
        ID_TOKEN: res.authResult.AuthenticationResult.IdToken,
        REFRESH_TOKEN: res.authResult.AuthenticationResult.RefreshToken
      })
      return true
    } else {
      if (res.name === 'UserNotFoundException') {
        return 'UserNotFoundException'
      } else if (res.name === 'NotAuthorizedException') {
        return 'NotAuthorizedException'
      } else {
        return 'Unknown'
      }
    }
  })


  ipcMain.handle('check-login', async (_event, args) => {
    const res = await apiPost('auth/login', args)
    if (res && !res.error) {
      const curentUserId = await Setting.get("USER_ID")
      const checkLoginUserId = res.user.UserAttributes.find((item: any) => item.Name === 'sub').Value
      
      if (curentUserId == checkLoginUserId) {
        return true
      } else {
        return "không trùng khớp với tài khoản đang đăng nhập"
      }
    } else {
      if (res.name === 'UserNotFoundException') {
        return 'Tài khoản không tồn tại'
      } else if (res.name === 'NotAuthorizedException') {
        return 'Thông tin đăng nhập không đúng'
      } else {
        return 'Lỗi sảy ra'
      }
    }
  })
}

const registerHandle = () => {
  // @ts-ignore
  ipcMain.handle('register', async (event, args) => {
    await shell.openExternal('https://dashboard.safezone.com.vn/signup')
  })
}

const deviceHandle = () => {
  // @ts-ignore
  ipcMain.handle('device', async (event, args) => {
    return {
      id: await machineId(true),
      name: os.hostname(),
      platform: isWindows ? 'Windows' : 'MacOS'
    }
  })
}

const deviceNewHandle = () => {
  // @ts-ignore
  ipcMain.handle('deviceNew', async (event, args) => {
    const res = await apiPost(`users/${await Setting.get('USER_ID')}/devices`, args)
    if (res && !res.error) {
      await Setting.set({
        CHILD_ID: res.device.children[0],
        DEVICES_ID: res.device.id,
        DEVICE_NAME: res.device.name
      })
      return true
    } else {
      if (res && res.error && res?.message === 'This device is used by other parents.') {
        await dialog.showMessageBox({
          title: 'SafeZone',
          message: 'Thiết bị này đã được thêm vào tài khoản khác!',
          icon: nativeImage.createFromPath(icon32)
        })
      }
      return 'Unknown'
    }
  })
}

const doneHandle = () => {
  // @ts-ignore
  ipcMain.handle('done', async (event, args) => {
    const mainWindow = await getMainWindow()
    mainWindow.hide()

    await Setting.set('PIN', bcrypt.hashSync(args.pin, 10))

    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    } else {
      app.setLoginItemSettings({
        openAtLogin: true
      })
    }
    await startService()
  })
}

const saveNewPinHandle = () => {
  // @ts-ignore
  ipcMain.handle('saveNewPin', async (event, args) => {
    await Setting.set('PIN', bcrypt.hashSync(args.pin, 10))
    dialog.showMessageBox({
      title: 'SafeZone',
      message: 'Thay đổi mã PIN thành công',
      icon: nativeImage.createFromDataURL(icon16)
    })
  })
}

const checkPinHandle = () => {
  // @ts-ignore
  ipcMain.handle('checkPin', async (event, args) => {
    pinPassed = bcrypt.compareSync(args.pin, await Setting.get('PIN'))
    return pinPassed
  })
}

const childrenHandle = () => {
  // @ts-ignore
  ipcMain.handle('children', async (event, args) => {
    const res = await apiGet(`users/${await Setting.get('USER_ID')}/children`, args)
    if (res && !res.error) {
      return res.result.map((item: any) => {
        return {
          id: item.id,
          gender: item.gender,
          name: item.fullname
        }
      })
    } else {
      return []
    }
  })
}

const unlockHandle = () => {
  // @ts-ignore
  ipcMain.handle('unlock', async (event, args) => {
    pauseSafeZone();
    unlockRestrictScreen();
  })
}

const hidePinHandle = () => {
  // @ts-ignore
  ipcMain.handle('hidePin', async (event, args) => {
    const pinWindow = await getPinWindow()
    pinWindow.hide()
    pinPassed = 'cancel'
  })
}

const sleepHandle = () => {
  // @ts-ignore
  ipcMain.handle('sleep', async (event, args) => {
    startSleep()
  })
}

const checkPin = async () => {
  checkPinHandle()
  hidePinHandle()
  const pinWin = await getPinWindow()
  // pinWin.reload()
  pinWin.show()
  pinPassed = undefined
  while (pinPassed === undefined) {
    await sleep(100)
  }
  pinWin.hide()
  ipcMain.removeHandler('checkPin')
  ipcMain.removeHandler('hidePin')
  if (pinPassed === true) {
    pinPassed = undefined
    return true
  } else {
    if (pinPassed === false) {
      await dialog.showMessageBox({
        title: 'SafeZone',
        message: 'Mã bảo vệ không chính xác!',
        icon: nativeImage.createFromDataURL(icon16)
      })
    }
    pinPassed = undefined
    return false
  }
}

const showChangePinHandle = () => {
  ipcMain.handle('showChangePin', async () => {
    showChangePin()
  })
}
const showChangePin = async () => {
  let windows = await getChangePinWindows(false)
  if (windows && !windows.isDestroyed()) {
    // not thing change
    windows.show()
    windows.focus()
  } else {
    windows = await getChangePinWindows(true)
    
    setTimeout(() => {
      windows.show()
      windows.focus()
    }, 1000)
  }
}

const hideChangePinHandle = () => {
  // @ts-ignore
  ipcMain.handle('closeChangePin', async (event, args) => {
    const window = await getChangePinWindows()
    if (window) {
      window.close()
    }
    // window.hide()
    
  })
}


const allHandle = () => {
  loginHandle()
  registerHandle()
  deviceHandle()
  deviceNewHandle()
  doneHandle()
  saveNewPinHandle()
  childrenHandle()
  unlockHandle()
  sleepHandle()
  showChangePinHandle()
  hideChangePinHandle()
}

export {
  loginHandle,
  registerHandle,
  deviceHandle,
  deviceNewHandle,
  doneHandle,
  saveNewPinHandle,
  childrenHandle,
  allHandle,
  checkPin,
  checkPinHandle,
  showChangePin
}
