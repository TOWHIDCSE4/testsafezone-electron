import { apiGet } from './api'
import Setting from './setting'
import { CategoryRuleRepository, DomainRuleRepository } from './repositories'
import { In, Not } from 'typeorm'
import {writeLog} from "./log";

const url2domain = (url) => {
  return new URL(url).hostname
}

const objectMap = (object, mapFn) => {
  return Object.keys(object).reduce(function(result, key) {
    result[key] = mapFn(object[key])
    return result
  }, {})
}

const updateZvelo = async () => {
  const res = await apiGet('zvelo/get-key')
  if (res && res.error) {
    writeLog(res, 'Zvelo')
  } else {
    await Setting.set('ZVELO_KEY', res.toString().trim())
  }
}

const updateWebRule = async () => {
  const res = await apiGet(
    `users/${await Setting.get('USER_ID')}/children/${await Setting.get(
      'CHILD_ID'
    )}/rules/web-filtering`
  )
  if (res && res.success) {
    await Setting.set('WEB_FILTER', res.rule.enabled)

    for (const categoryRule of res.rule.categoryRules) {
      await CategoryRuleRepository.upsert(
        {
          categoryId: categoryRule.categoryId,
          action: categoryRule.action
        },
        {
          conflictPaths: ['categoryId'],
          skipUpdateIfNoValuesChanged: true
        }
      )
    }

    for (const domainRule of res.rule.domainRules) {
      await DomainRuleRepository.upsert(
        {
          domain: url2domain(domainRule.name),
          action: domainRule.action
        },
        {
          conflictPaths: ['domain'],
          skipUpdateIfNoValuesChanged: true
        }
      )
    }

    const deleteDomains = await DomainRuleRepository.findBy({
      domain: Not(In(res.rule.domainRules.map((item) => url2domain(item.name))))
    })

    if (deleteDomains.length > 0) {
      await DomainRuleRepository.remove(deleteDomains)
    }
  } else {
    writeLog(res, 'updateWebRule')
  }
}

const updateRestrictedTimeRule = async () => {
  const res = await apiGet(
    `users/${await Setting.get('USER_ID')}/children/${await Setting.get(
      'CHILD_ID'
    )}/rules/restricted-times`
  )
  console.log("updateRestrictedTimeRule ", JSON.stringify(res));
  
  if (res && res.success) {
    await Setting.set('RESTRICTED_TIMES', res.rule.enabled)
    await Setting.set('RESTRICTED_TIMES_LIMIT', JSON.stringify(objectMap(res.rule.limit, items => items.map(item => {
      return parseInt(item.limitFrom.split(':')[0])
    }))))
    await Setting.set('RESTRICTED_TIMES_ALERT', res.rule.triggers.timesup.alertMe)
    await Setting.set('RESTRICTED_TIMES_DEVICE', res.rule.triggers.timesup.lockDevice)
    await Setting.set('RESTRICTED_TIMES_NAV', res.rule.triggers.timesup.lockNavigation)

    await Setting.set('QUICK_PAUSE_NAV_START_TIME', res.rule.internet_pause_start_time ?? 0)
    await Setting.set('QUICK_PAUSE_NAV_TIME_LIMIT', res.rule.internet_pause_time_limit ?? 0)
  } else {
    writeLog(res, 'updateRestrictedTimeRule')
  }
}

const updateDailyTimeRule = async () => {
  const res = await apiGet(
    `users/${await Setting.get('USER_ID')}/children/${await Setting.get(
      'CHILD_ID'
    )}/rules/daily-time-limit`
  )
  if (res && res.success) {
    await Setting.set('DAILY_TIME', res.rule.enabled)
    await Setting.set('DAILY_TIME_LIMIT', JSON.stringify(objectMap(res.rule.limit, item => {
      if (item === null) {
        return 1000 * 60 *60 * 24
      }
      else {
        return (new Date(`1970-01-01T${item}:00Z`)).getTime()
      }
    })))
    await Setting.set('DAILY_TIME_ALERT', res.rule.triggers.timesup.alertMe)
    await Setting.set('DAILY_TIME_DEVICE', res.rule.triggers.timesup.lockDevice)
    await Setting.set('DAILY_TIME_NAV', res.rule.triggers.timesup.lockNavigation)
  } else {
    writeLog(res, 'updateDailyTimeRule')
  }
}

const updateActivityControlRule = async () => {
  const res = await apiGet(
    `users/${await Setting.get('USER_ID')}/children/${await Setting.get(
      'CHILD_ID'
    )}/rules/activity-control`
  )
  // console.log("updateActivityControlRule: ", res)
  if (res && res.success) {
    await Setting.set(
      'ACTIVITY_CONTROL',
      JSON.stringify(
        res.rules
          .filter((item) => item.activity.activityType === 'APP' && item.action === 'BLOCK')
          .map((item) => {
            return {
              name: item.activity.activityName
              // path: item.activity.activityMetadata,
            }
          })
      )
    )
  } else {
    writeLog(res, 'updateActivityControlRule')
  }
}

const updateRules = async () => {
  await updateZvelo()
  await updateWebRule()
  await updateRestrictedTimeRule()
  await updateDailyTimeRule()
  await updateActivityControlRule()
}

export {
  updateRules,
  updateZvelo,
  updateWebRule,
  updateRestrictedTimeRule,
  updateDailyTimeRule,
  updateActivityControlRule
}
