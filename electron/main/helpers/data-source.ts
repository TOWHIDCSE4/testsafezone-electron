import { DataSource } from 'typeorm'
import { Activity } from '../entities/activity'
import { AppBlock } from '../entities/app-block'
import { CategoryRule } from '../entities/category-rule'
import { DomainRule } from '../entities/domain-rule'
import { Setting } from '../entities/setting'
import sleep from './sleep'
import pathUserData from './path-user-data'

const AppDataSource = new DataSource({
  type: 'better-sqlite3',
  database: `${pathUserData}/safezone.db`,
  synchronize: true,
  entities: [Activity, AppBlock, CategoryRule, DomainRule, Setting]
  // migrations: ["../migrations/*.ts"]
})

AppDataSource.initialize()
  .then(() => {
    console.log('Data Source has been initialized!')
  })
  .catch((err: any) => {
    console.error('Error during Data Source initialization', err)
  })

export default AppDataSource

export const DataSourceReady = async () => {
  while (!AppDataSource.isConnected) {
    await sleep(500)
  }
}
