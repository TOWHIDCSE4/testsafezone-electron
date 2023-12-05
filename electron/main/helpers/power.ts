import { isWindows } from './platform'
import powershell from './powershell'

const startSleep = () => {
  if (isWindows) {
    powershell('rundll32.exe powrprof.dll,SetSuspendState Standby', true)
  }
}

export { startSleep }
