import powershell from './powershell'
import { isLinux, isMac, isWindows } from './platform'

const ignores = ['HxOutlook', 'SafeZone', 'explorer', 'TextInputHost', 'ApplicationFrameHost']

const getProcesses = (): any => {
  if (isWindows) {
    const res = powershell(
      //'get-process | where {$_.mainWindowTitle} | where {$_.Path -notlike "C:\\WINDOWS\\*"}  | select Id,ProcessName,Name,Path,Company,Description,Product,MainWindowTitle,StartTime | ConvertTo-Json'
      'get-process | where {$_.mainWindowTitle} | select Id,ProcessName,Name,Path,Company,Description,Product,MainWindowTitle,StartTime | ConvertTo-Json'
    )
    return JSON.parse(res)
      .map((item: any) => {
        return {
          id: item.Id,
          name: item.ProcessName,
          path: item.Path,
          title: item.MainWindowTitle,
          startTime: eval('(new ' + item.StartTime.replaceAll('/', '') + ').toISOString()')
        }
      })
      .filter((item) => !ignores.includes(item.name))
  } else if (isMac) {
    return ['mac']
  } else if (isLinux) {
    return ['linux']
  } else {
    return ['N/A']
  }
}

const killProcessByName = (name) => {
  if (isWindows) {
    powershell(`taskkill /IM ${name} /F`, true)
  } else if (isMac) {
  } else if (isLinux) {
  } else {
  }
}

const killProcessById = (id) => {
  if (isWindows) {
    powershell(`taskkill /PID ${id} /F`, true)
  } else if (isMac) {
  } else if (isLinux) {
  } else {
  }
}

export { getProcesses, killProcessByName, killProcessById }
