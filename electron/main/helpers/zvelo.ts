import { crc16ccitt } from 'crc'
import * as dns from 'dns'
import Setting from './setting'
import { CategoryRuleRepository } from './repositories'
import { DataSourceReady } from './data-source'
import { In } from 'typeorm'

const zvelo_prefix = 'sh'
const zvelo_cat = '0'
const serialNumber = '123456'

const getCategory = async (domain) => {
  const zvelo_key = await Setting.get('ZVELO_KEY')
  const hashKey = `${domain}${zvelo_key}${zvelo_prefix}-${serialNumber}`
  const authString = crc16ccitt(hashKey).toString(16).toUpperCase()
  const dnsUrl = `${zvelo_cat}.${domain}.${authString}.${zvelo_prefix}-${serialNumber}.url.zvelo.com`
  return (await dns.promises.resolveTxt(dnsUrl))[0][0].split('\t')[0]
}

const checkCategory = async (domain) => {
  await DataSourceReady()
  try {
    const category = await getCategory(domain)
    const _category = await CategoryRuleRepository.findOneBy({
      categoryId: In(category.split('_')),
      action: 'BLOCK'
    })
    return !!_category
  } catch (e) {
    return false
  }
}

export { checkCategory, getCategory }
