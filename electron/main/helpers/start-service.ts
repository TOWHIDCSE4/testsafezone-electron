
import { trustCACert } from './trust-certificate'
import {runActivityWorker, runAppUsageWorker, runProxyWorker, runUpdateRuleWorker, runUseTimeWorker} from './worker'
import { updateRules } from './rules'
import { showTray } from './show-tray'
import { writeLog } from './log'
import { proxyEnable } from './proxy'

export default async () => {
  writeLog("")
  writeLog("------------START----------")
  showTray()
  trustCACert()
  proxyEnable()
  runProxyWorker()
  runAppUsageWorker()
  await updateRules()
  runUpdateRuleWorker()
  runActivityWorker()
  runUseTimeWorker()
  writeLog('Service started')
}
