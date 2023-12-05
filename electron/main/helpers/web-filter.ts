import { DataSourceReady } from './data-source'
import { ActivityRepository, DomainRuleRepository } from './repositories'
import { checkCategory } from './zvelo'
// import {apiPost} from "./api";
// import Setting from "./setting";
import { MoreThan } from 'typeorm'

const isBlock = async (domain: string) => {
  await DataSourceReady()
  const _domain = await DomainRuleRepository.findOneBy({
    domain: domain
  })
  if (_domain) {
    return _domain.action === 'BLOCK'
  } else {
    return await checkCategory(domain)
  }
}

const activityWebBlock = async (domain, isBlock) => {
  await DataSourceReady()
  const now = Date.now()
  let entity = {
    activityName: domain,
    activityType: 'WEB_SURF',
    questionable: isBlock
  }

  const activity = await ActivityRepository.findOneBy({
    ...entity,
    activityTimeStart: MoreThan(now - 60 * 1000)
  })

  if (!activity) {
    // const res = await apiPost(`users/${await Setting.get('USER_ID')}/children/${await Setting.get('CHILD_ID')}/activities`, {
    //   ...entity,
    //   deviceId: await Setting.get('DEVICES_ID')
    // })
    //
    // if (res && res.success) {
    //   entity['_id'] = res.activity.id
    // }

    await ActivityRepository.insert({
      ...entity,
      activityTimeStart: now,
      lastUpdated: now,
    })
  }
}

export { isBlock, activityWebBlock }
