import madcert from 'madcert'
import fs from 'fs-extra'
import { isMac, isWindows } from './platform'
import powershell from './powershell'
import pathUserData from './path-user-data'

const pathCACert = `${pathUserData}/safezone-root-ca`

const createCACert = () => {
  if (!fs.existsSync(pathCACert)) {
    madcert.createCACert('SafeZone Root CA', {
      validFrom: '2023-01-01',
      validTo: '2030-01-01',
      country: 'Hamia Edu'
    })
    fs.moveSync(fs.realpathSync('./pki/safezone-root-ca'), pathCACert)
  }
}

const trustCACert = () => {
  createCACert()
  if (isWindows) {
    powershell('certutil -f -addstore ROOT ' + fs.realpathSync(`${pathCACert}/ca/crt.pem`), true)
  } else if (isMac) {
    //'security add-trusted-cert -d -r trustRoot -k /Library/Keychains/System.keychain ' + fs.realpathSync(`${patCACert}/ca/crt.pem`)
  }
}

export { pathCACert, createCACert, trustCACert }
