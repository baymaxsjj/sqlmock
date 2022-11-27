import MysqlAdapter from './adapter/mysql-adapter'
import { SequelizeMysqlPlugin, SequelizeSqlitePlugin } from './adapter/sequelize-adapter'
// import SequelizePlugin from "./adapter/SequelizeAdapter";
import baseDbAdapter, { dbConnectInfo, dbPlugin } from './base-db'
// 注册器
class dbMocke {
  dbAdapters: Map<string, dbPlugin> = new Map()
  version = 1
  /**
   * 注册适配器
   * @param plugin 插件
   */
  use(plugin: dbPlugin): void {
    if (this.dbAdapters.has(plugin.uuid)) {
      throw '命名冲突'
    } else {
      this.dbAdapters.set(plugin.uuid, plugin)
    }
  }
  getAdapterType(): object {
    const allType: Record<string,unknown> = {}
    this.dbAdapters.forEach((value: dbPlugin) => {
      allType[value.uuid] = value.name
    })
    return allType
  }
  /**
   * 获取数据库适配器
   * @param type 数据库类型
   * @param connInfo 连接信息
   * @returns
   */
  getAdapterByUuid(uuid: string, connInfo: dbConnectInfo): baseDbAdapter {
    if (this.dbAdapters.has(uuid)) {
      const plugin = this.dbAdapters.get(uuid)
      return plugin!.install(connInfo)
    } else {
      throw '数据适配器未定义'
    }
  }
}
const dbmock = new dbMocke()
dbmock.use(new MysqlAdapter())
dbmock.use(new SequelizeMysqlPlugin())
dbmock.use(new SequelizeSqlitePlugin())
//还是单独适配吧！bug
// dbmock.use(new SequelizePlugin())

export default dbmock
