import {spawnSync} from 'child_process'
import sleep from "./sleep";

const powershell = (input: string, asAdmin: boolean = false) => {
  if (asAdmin) {
    return spawnSync('chcp 65001 >NUL & powershell.exe -NonInteractive -NoProfile -Command -', {
      shell: true,
      encoding: 'utf-8',
      input: `Start-Process -FilePath 'cmd' -Credential (New-Object System.Management.Automation.PSCredential 'Administrator', (ConvertTo-SecureString '123123@Hamia' -AsPlainText -Force)) -WindowStyle Hidden -ArgumentList {/c ${input}}`
    }).stdout
  }
  else {
    return spawnSync('chcp 65001 >NUL & powershell.exe -NonInteractive -NoProfile -Command -', {
      shell: true,
      encoding: 'utf-8',
      input: input
    }).stdout
  }
}
export default powershell

const checkAdmin = () => {
  return JSON.parse(powershell('Get-LocalUser | Where {$_.Name -eq "Administrator"} | Select Name,Enabled | ConvertTo-Json')).Enabled
}

export const initRunAsAdmin = async () => {

  if (!checkAdmin()) {
    powershell('Start-Process -FilePath "./init-admin.exe"')
    while (!checkAdmin()) {
      await sleep(500)
    }
  }
}