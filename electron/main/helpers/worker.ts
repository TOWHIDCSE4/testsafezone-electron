import { ChildProcess, fork } from 'child_process'
import { resolve } from 'path'
import { pathCACert } from './trust-certificate'
import { killProcessById } from './processes'
import {getLockWindow} from "./windows";
import { writeLog } from './log';

let proxyServerProcess: ChildProcess
let trackingAppUsageProcess: ChildProcess
let updateRuleProcess: ChildProcess
let reportActivityProcess: ChildProcess
let checkUseTimeProcess: ChildProcess


const runProxyWorker = () => {
  proxyServerProcess = fork(resolve(__dirname, 'proxy.js'), [pathCACert])
  writeLog("runProxyWorker pid: " + proxyServerProcess.pid, "worker")
  proxyServerProcess.on('message', function (message) {
    // @ts-ignore
    const data = Object.assign({}, message)

    // console.log(data)
  })
  proxyServerProcess.on('exit', function (code) {
    writeLog('proxy process exited with code ' + code, 'worker')
    proxyServerProcess.removeAllListeners()
    runProxyWorker()
  })
  // proxy.on('close', function (code) {
  //   writeLog('proxy process closed with code ' + code, 'worker')
  //   proxy.removeAllListeners()
  //   runProxyWorker()
  // })
}

const runAppUsageWorker = () => {
  trackingAppUsageProcess = fork(resolve(__dirname, 'process.js'))
  writeLog("trackingAppUsageProcess pid: " + trackingAppUsageProcess.pid, "worker")
  trackingAppUsageProcess.on('message', function (message) {
    // @ts-ignore
    const data:any = Object.assign({}, message)

    if (data.kill) {
      killProcessById(data.kill)
    }
  })
  trackingAppUsageProcess.on('exit', function (code) {
    writeLog('trackingAppUsage process exited with code ' + code, 'worker')
    trackingAppUsageProcess.removeAllListeners()
    runAppUsageWorker()
  })
}

const runUpdateRuleWorker = () => {
  updateRuleProcess = fork(resolve(__dirname, 'update-rule.js'))
  writeLog("runUpdateRule process pid: " + updateRuleProcess.pid, "worker")
  updateRuleProcess.on('message', function (message) {
    // @ts-ignore
    const data = Object.assign({}, message)

    // console.log(data)
  })
  updateRuleProcess.on('exit', function (code) {
    writeLog('rule process exited with code ' + code, 'worker')
    updateRuleProcess.removeAllListeners()
    runUpdateRuleWorker()
  })
}

// let currentUseTimeAction = 'open'
let currentDeviceAction = 'open'
let currentNavAction = 'unlock-navigation'


const runUseTimeWorker = () => {
  checkUseTimeProcess = fork(resolve(__dirname, 'use-time.js'))
  writeLog("checkUseTime process pid: " + checkUseTimeProcess.pid, "worker")
  checkUseTimeProcess.on('message', async function (message) {
    const data:any = Object.assign({}, message)

    if (data.action && data.actionType == "device" && data.action !== currentDeviceAction) {
      writeLog(`update action: ${data.action}`, 'runUseTimeWorker')
      switch (data.action) {
        case 'lock-device':
          setTimeout(async ()=>{
            (await getLockWindow()).show()
          },1)
          break;
        case 'open':
          // proxy.send('proxy-unlock-navigation', undefined, undefined, () => {})
          unlockRestrictScreen()
          break;
      }
      currentDeviceAction = data.action
    }

    if (data.action && data.actionType == "web-navigation" && data.action !== currentNavAction) {
      writeLog(`update action: ${data.action}`, 'runUseTimeWorker')
      switch (data.action) {
        case 'lock-navigation':
          proxyServerProcess.send('proxy-lock-navigation', undefined, undefined, () => {})
          break;
        case 'unlock-navigation':
          proxyServerProcess.send('proxy-unlock-navigation', undefined, undefined, () => {})
          break;
        
      }
      currentNavAction = data.action
    }
    // console.log(data)
  })
  checkUseTimeProcess.on('exit', function (code) {
    writeLog('checkUseTime process exited with code ' + code, 'worker')
    checkUseTimeProcess.removeAllListeners()
    runUseTimeWorker()
  })
}

const unlockRestrictScreen = () => {
  currentDeviceAction = 'open'
  setTimeout(async ()=>{
    (await getLockWindow()).hide()
  },1)
}

const runActivityWorker = () => {
  reportActivityProcess = fork(resolve(__dirname, 'activity.js'))
  writeLog("reportActivity process pid: " + reportActivityProcess.pid, "worker")
  reportActivityProcess.on('message', function (message) {
    // @ts-ignore
    const data = Object.assign({}, message)

    // console.log(data)
  })
  reportActivityProcess.on('exit', function (code) {
    writeLog('reportActivity process exited with code ' + code, 'worker')
    reportActivityProcess.removeAllListeners()
    runActivityWorker()
  })
}

const pauseWorker = () => {
  proxyServerProcess.send('pause', undefined, undefined, () => {})
  trackingAppUsageProcess.send('pause', undefined, undefined, () => {})
  reportActivityProcess.send('pause', undefined, undefined, () => {})
  checkUseTimeProcess.send('pause', undefined, undefined, () => {})
}

const resumeWorker = () => {
  proxyServerProcess.send('resume', undefined, undefined, () => {})
  trackingAppUsageProcess.send('resume', undefined, undefined, () => {})
  reportActivityProcess.send('resume', undefined, undefined, () => {})
  checkUseTimeProcess.send('resume', undefined, undefined, () => {})
}

export {
  runProxyWorker,
  runAppUsageWorker,
  runUpdateRuleWorker,
  runActivityWorker,
  runUseTimeWorker,
  pauseWorker,
  resumeWorker,
  unlockRestrictScreen
}
