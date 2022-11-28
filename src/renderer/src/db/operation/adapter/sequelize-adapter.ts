import baseDbAdapter, { dbConnectInfo, dbPlugin } from '../base-db'
import { MysqlAdapter } from './mysql-adapter'
const { Sequelize, QueryTypes } = require('sequelize')
class SequelizeAdapter extends MysqlAdapter {
  connectInfo: dbConnectInfo
  queryTypes = QueryTypes.SELECT
  constructor(connectInfo: dbConnectInfo) {
    super(connectInfo)
    this.connectInfo = connectInfo
  }
  declare updated?: (<T>(sql: string, sqlParams: unknown[]) => Promise<T>) | undefined
  declare delete?: (<T>(sql: string, sqlParams: unknown[]) => Promise<T>) | undefined
  connect(): any {
    let type
    switch (this.connectInfo.type) {
      case 'sqlit':
        type = 'sqlit'
        break
      default:
      case 'mysql':
        type = 'mysql'
    }
    const sequelize = new Sequelize(
      this.connectInfo.database,
      this.connectInfo.username,
      this.connectInfo.password,
      {
        host: this.connectInfo.host,
        dialect: type /* 选择 'mysql' | 'mariadb' | 'postgres' | 'mssql' 其一 */
      }
    )
    return sequelize
  }
  testConn(): Promise<unknown> {
    return this.connect().authenticate()
  }
  async select<T, U>(sql: string, sqlParams: unknown[], callback: (results: U) => T): Promise<T> {
    console.log('queryTypes', this.queryTypes)
    const promise = new Promise<T>((resolve, reject) => {
      this.connect()
        .query(sql, {
          replacements: sqlParams
          // type:this.queryTypes
        })
        .then((results: Array<U>) => {
          console.log(results)
          resolve(callback(results[0]))
        })
        .catch((error: unknown) => {
          console.log(error)
          reject(error)
        })
    })
    return promise
    // 结果将是一个空数组,元数据将包含受影响的行数.
  }
  close(): Promise<unknown> | unknown {
    return this.connect().close()
  }
}
export class SequelizeMysqlPlugin implements dbPlugin {
  uuid = 'baymax.seque.mysql'
  name = 'Mysql2'
  dbType = 'mysql'
  defaultHost = 'localhost'
  defaultPort = 3306
  version = 1
  install(connectInfo: dbConnectInfo): baseDbAdapter {
    connectInfo.type = this.dbType
    return new SequelizeAdapter(connectInfo)
  }
}
export class SequelizeSqlitePlugin implements dbPlugin {
  uuid = 'baymax.seque.sqlite'
  name = 'Sqlite'
  dbType = 'sqlite'
  defaultHost = 'localhost'
  defaultPort = 3306
  version = 1
  install(connectInfo: dbConnectInfo): baseDbAdapter {
    connectInfo.type = this.dbType
    return new SequelizeAdapter(connectInfo)
  }
}
