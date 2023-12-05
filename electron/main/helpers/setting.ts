import { SettingRepository } from './repositories'
import { DataSourceReady } from './data-source'

const casts = {
  'WEB_FILTER': 'boolean',
  'RESTRICTED_TIMES': 'boolean',
  'RESTRICTED_TIMES_ALERT': 'boolean',
  'RESTRICTED_TIMES_DEVICE': 'boolean',
  'RESTRICTED_TIMES_NAV': 'boolean',
  'RESTRICTED_TIMES_LIMIT': 'object',
  'DAILY_TIME': 'boolean',
  'DAILY_TIME_ALERT': 'boolean',
  'DAILY_TIME_DEVICE': 'boolean',
  'DAILY_TIME_NAV': 'boolean',
  'DAILY_TIME_LIMIT': 'object',
  'ACTIVITY_CONTROL': 'object',
}

const castValue = (_setting) => {
  if (Object.keys(casts).includes(_setting.key)) {
    switch (casts[_setting.key]) {
      case 'boolean':
        return _setting.value == '1.0'
      case 'float':
        return parseFloat(_setting.value)
      case 'integer':
        return parseInt(_setting.value)
      case 'object':
        return JSON.parse(_setting.value)
    }
  } else {
    return _setting.value
  }
}

export default class Setting {

  public static get = async (key: string, defaultValue: any = null) => {
    await DataSourceReady()
    const _setting = await SettingRepository.findOneBy({
      key: key
    })
    return _setting ? castValue(_setting) : defaultValue
  }

  public static set = async (key: any, value: any = null) => {
    await DataSourceReady()
    let settings: object = {}
    if (typeof key === 'object') {
      settings = key
    } else {
      settings[key] = value
    }
    for (const key of Object.keys(settings)) {
      await SettingRepository.upsert(
        {
          key: key,
          value: settings[key]
        },
        {
          conflictPaths: ['key'],
          skipUpdateIfNoValuesChanged: true
        }
      )
    }

    return true
  }

  public static getUseTime = async () => {
    await DataSourceReady()
    const now = new Date()
    return parseInt(await this.get(`USE_TIME_${now.getFullYear()}_${now.getMonth()+1}_${now.getDate()}`, 0))
  }

  public static setUseTime = async (value) => {
    await DataSourceReady()
    const now = new Date()
    await this.set(`USE_TIME_${now.getFullYear()}_${now.getMonth()+1}_${now.getDate()}`, value)
  }
}
