import { TIME_CHECK_LOCK_SCREEN } from '../const/interval-const'
import Setting from '../helpers/setting'

let isPause = false
let isLock = false

const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']

process.on('message', function (message) {
  try {
    if (message == 'pause') {
      isPause = true
    } else if (message == 'resume') {
      isPause = false
    } else if (message == 'lock') {
      isLock = true
    } else if (message == 'open') {
      isLock = false
    }
  } catch (e) {}
})

let oldTimeNow:any = null
//Check mỗi 1p
setInterval(async () => {
  try {
    if (!isPause) {
      // console.log('check time')
      const now = new Date()
      const day = days[now.getDay()]
      const useTime = await Setting.getUseTime()
      
      let timeSpan = TIME_CHECK_LOCK_SCREEN
      if (oldTimeNow) {
        timeSpan = now.getTime() - oldTimeNow.getTime();
      }

      oldTimeNow = now
      if (!isLock) {
        await Setting.setUseTime(useTime + timeSpan)
      }

      let isLockDevice = false;
      let isLockNavigation = false;
      let lockReason : String | null= null;

      // quick restrict web nav
      const quickPauseNavStartTime = Number(await Setting.get('QUICK_PAUSE_NAV_START_TIME'))
      const quickPauseNavTimeLimit = Number(await Setting.get('QUICK_PAUSE_NAV_TIME_LIMIT'))
      if (quickPauseNavStartTime && quickPauseNavTimeLimit) {
        const timestampPauseUntil = quickPauseNavStartTime + (quickPauseNavTimeLimit * 60 * 1000)
        //  console.log("check pause: current time and block until ", now.toLocaleString(), new Date(timestampPauseUntil).toLocaleString())
         if (now.getTime() < (timestampPauseUntil)) {
            isLockNavigation = true;
            lockReason = "quick_pause"
         }
      }


      // restrict hour limit
      const restrictedTimesEnable = await Setting.get('RESTRICTED_TIMES')
      const restrictedTimes = await Setting.get('RESTRICTED_TIMES_LIMIT')
      if (
        restrictedTimesEnable &&
        restrictedTimes[day] &&
        restrictedTimes[day].includes(now.getHours())
      ) {
        const isRestrictDevice = await Setting.get('RESTRICTED_TIMES_DEVICE')
        const isRestrictNavigation = await Setting.get('RESTRICTED_TIMES_NAV')
        if (isRestrictDevice) {
            isLockDevice = true;
            lockReason = "restrict_time"
        }
        if (isRestrictNavigation) {
            isLockNavigation = true;
            lockReason = "restrict_time"
        }
      }

      // daily limit time use
      const isEnableDailyTime = await Setting.get('DAILY_TIME')
      const dailyTimes = await Setting.get('DAILY_TIME_LIMIT')
    //   console.log("time use: ", isEnableDailyTime, useTime, dailyTimes[day]);
      
      if (isEnableDailyTime && dailyTimes[day] && (useTime > dailyTimes[day])) {
        const isLockDeviceByDailyTime = await Setting.get('DAILY_TIME_DEVICE')
        const isRestrictNavigationByDailyTime = await Setting.get('DAILY_TIME_NAV')
        if (isLockDeviceByDailyTime) {
            isLockDevice = true;
            lockReason = "daily_quota"
        }
        if (isRestrictNavigationByDailyTime) {
            isLockNavigation = true;
            lockReason = "daily_quota"
        }
      }

      if (isLockDevice) {
        process.send!({
                action: 'lock-device',
                lockReason,
                actionType: 'device'
              })
      } else {
        process.send!({
            action: 'open',
            lockReason,
            actionType: 'device'
          })
      }

      if (isLockNavigation){
        process.send!({
            action: 'lock-navigation',
            lockReason,
            actionType: 'web-navigation'
          })
      } else {
        process.send!({
            action: 'unlock-navigation',
            lockReason,
            actionType: 'web-navigation'
          })
      }
    }
  } catch (e) {}
}, TIME_CHECK_LOCK_SCREEN)
