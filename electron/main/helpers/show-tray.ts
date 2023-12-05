import { app, Menu, nativeImage, Notification, Tray } from 'electron'
import path from 'path';
import { icon16, icon16_gray, icon32 } from './resources'
import { checkPin, showChangePin } from './ipc-handle'
import appExit from './app-exit'
import {updateActivityControlRule, updateDailyTimeRule, updateRestrictedTimeRule, updateWebRule} from './rules'
import { pauseWorker, resumeWorker } from './worker'
import Setting from './setting';
import { convertMsToHM } from '../utils/utils';
import { getLockWindow } from './windows';

let isPause = false
let tray

const imgAppIcon16 = nativeImage.createFromDataURL(icon16)
const imgAppIcon16Gray = nativeImage.createFromDataURL(icon16_gray)
const imgAppIcon32 = nativeImage.createFromDataURL(icon32)
// const showAbout = () => {}

const exit = async () => {
  if (await checkPin()) {
    await appExit()
  }
}

const togglePause = async () => {
  if (isPause || (await checkPin())) {
    // isPause = !isPause
    if (!isPause) {
      pauseSafeZone();
    } else {
      resumeSafeZone();
    }
  }
}


const pauseSafeZone = () => {
  isPause = true;
  pauseWorker()
  new Notification({
    title: 'SafeZone',
    body: 'Ứng dụng đã dừng !',
    icon: imgAppIcon32
  }).show()
  //reload tray
  updateTrayUI();
}
const resumeSafeZone = () => {
  isPause = false;
  resumeWorker()
  new Notification({
    title: 'SafeZone',
    body: 'Ứng dụng đang chạy !',
    icon: imgAppIcon32
  }).show()
  //reload tray
  updateTrayUI();
  
}

const updateTrayUI = () => {
  buildMenu().then((menu) => {
    tray.setContextMenu(menu)
    tray.setToolTip('SafeZone ' + (isPause ? "đã tạm dừng" : "đang chạy"))
    tray.setImage(isPause ? imgAppIcon16Gray : imgAppIcon16);
    // TODO
  })
 
}

const updateRules = async () => {
  await updateWebRule()
  await updateRestrictedTimeRule()
  await updateDailyTimeRule()
  await updateActivityControlRule()
  new Notification({
    title: 'SafeZone',
    body: 'Đã cập nhật cài đặt!',
    icon: imgAppIcon32
  }).show()
  updateTrayUI();
}

const changePIN = async () => {
  showChangePin()
}

const lockDevice = async() => {
  const lockWindow = await getLockWindow()
  lockWindow.show()
}

const buildMenu = async () => {
  const userName = await Setting.get('USER_NAME')
  const childName = await Setting.get('CHILD_NAME', "")
  const timeUseInMs =  await Setting.getUseTime()
  const timeUseHM = convertMsToHM(timeUseInMs)
  return Menu.buildFromTemplate([
    { label: `SafeZone v${app.getVersion()}`, enabled: false },
    { label: `Tài khoản: ${userName} `, enabled: false },
    { label: `${childName} `, enabled: false },
    { label: `Thời gian sử dụng: ${timeUseHM}`, enabled: false },
    // { label: 'Giới thiệu', click: showAbout },
    { type: 'separator' },
    { label: 'Trạng thái: ' + (isPause ? 'Đang dừng' : 'Đang chạy'), enabled: false },
    { label: 'Cập nhật ngay cài đặt', click: updateRules },
    { label: isPause ? 'Tiếp tục' : 'Tạm dừng', click: togglePause },
    {
      label: 'Thay đổi mã PIN',
      click: changePIN
    },
    {
      label: 'Khóa thiết bị',
      click: lockDevice
    },
    {
      label: 'Thoát',
      click: exit
    }
  ])
}


const showTray = () => {
  new Notification({
    title: 'SafeZone',
    body: 'Ứng dụng đang chạy !',
    icon: imgAppIcon32
  }).show()
  tray = new Tray(imgAppIcon16)
  tray.setToolTip('SafeZone đang chạy')
  buildMenu().then((menu) => {
    tray.setContextMenu(menu)
  })
 
}

const RESOURCES_PATH = app.isPackaged
  ? path.join(process.resourcesPath, 'resources')
  : path.join(__dirname, '../../resources');

export const getAssetPath = (...paths: string[]): string => {
  return path.join(RESOURCES_PATH, ...paths);
};

export {
  showTray,
  pauseSafeZone,
  resumeSafeZone,
}
