import baseDbAdapter, { dbConnectInfo, dbPlugin, getSqlParmas } from '../base-db'
import { TableAttributes, TableInfo, TableKey } from '../table-type'

interface MysqlTableAttributes {
  Collation: null
  Comment: string
  Default: string
  Extra: string
  Field: string
  Key: string
  Null: string
  Privileges: string
  Type: string
}

export class MysqlAdapter implements baseDbAdapter {
  connectInfo: dbConnectInfo
  constructor(connectInfo: dbConnectInfo) {
    this.connectInfo = connectInfo
    console.warn('请勿频繁创建适配器')
  }
  close(): unknown {
    return
  }
  connectPool: unknown
  updated?: (<T>(sql: string, sqlParams: unknown[]) => Promise<T>) | undefined
  delete?: (<T>(sql: string, sqlParams: unknown[]) => Promise<T>) | undefined
  connect(): any {
    // if(this.connectPool){
    //     return this.connectPool
    // }
    const mysql = require('mysql2')
    console.warn('创建连接池')
    const connectPool = mysql.createPool({
      host: this.connectInfo.host,
      port: this.connectInfo.port,
      user: this.connectInfo.username,
      password: this.connectInfo.password,
      database: this.connectInfo.database,
      connectionLimit: 20, //"指定连接池中最大的链接数，默认是10",
      multipleStatements: true //"是否运行执行多条sql语句，默认值为false"
    })
    return connectPool
  }
  select<T, U>(sql: string, sqlParams?: Array<unknown>, callback?: (results: U) => T): Promise<T> {
    console.log('执行参数', sqlParams)
    const promise = new Promise<T>((resolve, reject) => {
      this.connect().getConnection((err: any, connect: any) => {
        if (err) {
          console.log(`数据库连接失败:${err.message}`)
          reject(err)
        }
        connect.query(sql, sqlParams, function (error: unknown, results: U) {
          if (error) reject(error)
          console.log(results)
          connect.release()
          if(callback){
            resolve(callback(results))
          }else{
            resolve(results as unknown as T)
          }
        })
      })
    })
    return promise
  }
  testConn(): Promise<unknown> {
    return this.select("SELECT 1+1 AS result")
  }
  async getTables(): Promise<Array<TableInfo>> {
    const sql = 'select table_name ,table_comment , create_time   from information_schema.tables where table_schema=?'
    const prom = await this.select<Array<TableInfo>, Array<TableInfo>>(
      sql,
      [this.connectInfo.database],
      (res: Array<TableInfo>): Array<TableInfo> => {
        return res
      }
    )
    return prom
  }
  formatTableAttr(attr: Array<MysqlTableAttributes>): Array<TableAttributes> {
    const arr: Array<TableAttributes> = []
    for (let i = 0; i < attr.length; i++) {
      const item = attr[i]
      let key: TableKey
      switch (item.Key) {
        case 'PRI':
          key = TableKey.PRI
          break
        case 'UNI':
          key = TableKey.UNI
          break
        case 'MUL':
          key = TableKey.MUL
          break
        default:
          key = TableKey.EMPTY
      }
      const newItem: TableAttributes = {
        Collation: item.Collation,
        Comment: item.Comment,
        Default: item.Default,
        Extra: item.Extra,
        Field: item.Field,
        Key: key,
        Null: item.Null == 'YES',
        Privileges: item.Privileges,
        Type: item.Type,
        Hidden: false,
        Mock: ''
      }
      arr[i] = newItem
    }
    console.log(arr)
    return arr
  }
  async getTablesAttribute(table: string): Promise<Array<TableAttributes>> {
    const sql = `show full columns from ` + table
    const prom = await this.select<Array<TableAttributes>, Array<MysqlTableAttributes>>(
      sql,
      [this.connectInfo.database],
      this.formatTableAttr
    )
    return prom
  }

  async insert(
    table: string,
    mock: Record<string, unknown> | Array<Record<string, unknown>>
  ): Promise<unknown> {
    // return
    let data: Array<Record<string, unknown>> = []
    if (mock instanceof Array) {
      data = mock
    } else {
      data.push(mock)
    }
    console.log('插入数据：', data)
    const sqlParams = getSqlParmas(data)
    const sql = `INSERT INTO ${table}(${sqlParams.fields.toString()}) VALUES ?`
    console.log('sql', sql)
    return this.select<unknown, unknown>(sql, [sqlParams.params], (res) => {
      return res
    })
  }
}
class MysqlPlugin implements dbPlugin {
  uuid = 'baymax.mysql'
  name = 'Mysql'
  dbType = 'mysql'
  defaultHost = 'localhost'
  defaultPort = 3306
  version = 1
  install(connectInfo: dbConnectInfo): baseDbAdapter {
    connectInfo.type = this.dbType
    return new MysqlAdapter(connectInfo)
  }
}
export default MysqlPlugin
export type { MysqlTableAttributes }
