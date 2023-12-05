import { writeLog } from './log'
import { isWindows } from './platform'
import powershell from './powershell'

const whiteList = [
  'safezone.com.vn',
  '*.safezone.com.vn',
  '4d996w6zk9.execute-api.ap-southeast-1.amazonaws.com',
  '0gs2mokc40.execute-api.ap-southeast-1.amazonaws.com',
  '*.zvelo.com',
  'api.github.com',
  '<local>'
]

const REG_KEY_INTERNET_SETTING = "\"HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings\""

const proxyEnable = () => {
  writeLog("proxyEnable", "proxy")
  try {
    if (isWindows) {
      powershell(
        'REG ADD "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 1 /f'
      )
      powershell(
        'REG ADD "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyServer /t REG_SZ /d "localhost:8000" /f'
      )
      powershell(
        `REG ADD "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyOverride /t REG_SZ /d "${whiteList.join(
          ';'
        )}" /f`
      )
    }
  } catch (error) {
    console.log("error: ", error)
  }
}

const proxyDisable = () => {
  writeLog("proxyDisable", "proxy")
  try {
    if (isWindows) {
      powershell(
        'REG ADD "HKEY_CURRENT_USER\\Software\\Microsoft\\Windows\\CurrentVersion\\Internet Settings" /v ProxyEnable /t REG_DWORD /d 0 /f'
      )
    }
  } catch (error) {
    console.log("error: ", error)
  }
}

const getValueOfRegistryCommand = (key: String, valueKey: String | null, type: String | null) => {
  try {
    const ret = powershell(
      `REG QUERY ${key} /v ${valueKey} /t ${type}`
    )
    const retStr = String(ret).split("\n")[2]
    // Example
     /*
      HKEY_CURRENT_USER\Software\Microsoft\Windows\CurrentVersion\Internet Settings
      ProxyEnable    REG_DWORD    0x1

      End of search: 1 match(es) found.
      */
  
    const valuesArray = retStr.replaceAll("\r", "").split("    ") // 4 spaces
    /**
     *  [ '', 'ProxyEnable', 'REG_DWORD', '0x1' ]
     */
    if (valuesArray != null){
      return valuesArray[3]
    }
    return null
  } catch (error) {
    console.error(error)
    return null
  }
}

const checkProxyEnable = (): boolean=> {
  try {
    if (isWindows) {
      const valueEnable = getValueOfRegistryCommand(REG_KEY_INTERNET_SETTING, "ProxyEnable", "REG_DWORD")
      if ("0x1" !== valueEnable) {
        return false
      }

      const valueProxyServer = getValueOfRegistryCommand(REG_KEY_INTERNET_SETTING, "ProxyServer", "REG_SZ")
      if ("localhost:8000" !== valueProxyServer) {
        return false
      }
      return true
    }
    return false
  } catch (error) {
    console.log("error: ", error)
    return false
  }
 
}

export { proxyEnable, proxyDisable, checkProxyEnable }
