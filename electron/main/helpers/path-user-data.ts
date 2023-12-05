import { env } from 'node:process'
import { isMac } from './platform'

export default (env.APPDATA ||
  (isMac ? env.HOME + '/Library/Preferences' : env.HOME + '/.local/share')) + '/safezone'
