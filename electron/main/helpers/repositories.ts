import AppDataSource from './data-source'
import { Activity } from '../entities/activity'
import { Setting } from '../entities/setting'
import { AppBlock } from '../entities/app-block'
import { CategoryRule } from '../entities/category-rule'
import { DomainRule } from '../entities/domain-rule'

const SettingRepository = AppDataSource.getRepository(Setting)
const ActivityRepository = AppDataSource.getRepository(Activity)
const AppBlockRepository = AppDataSource.getRepository(AppBlock)
const CategoryRuleRepository = AppDataSource.getRepository(CategoryRule)
const DomainRuleRepository = AppDataSource.getRepository(DomainRule)

export {
  SettingRepository,
  ActivityRepository,
  AppBlockRepository,
  CategoryRuleRepository,
  DomainRuleRepository
}
