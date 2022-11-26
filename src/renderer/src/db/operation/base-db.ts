import { TableAttributes, TableInfo } from './table-type'
/**
 * 数据库连接信息
 */
interface dbConnectInfo {
  type: string
  port: number
  host: string
  username: string
  password: string
  database: string
  other?: Record<string, unknown>
}
/**
 * 数据库适配器
 */
interface baseDbAdapter {
  connectInfo: dbConnectInfo
  /**
   * 连接数据库
   */
  connect: () => any
  /**
   * 测试数据库连接
   */
  testConn: () => Promise<any>
  /**
   * 查询数据库
   */
  select: <T, U>(sql: string, sqlParams: Array<any>, callback: (results: U) => T) => Promise<T>
  updated?: <T>(sql: string, sqlParams: Array<any>) => Promise<T>
  delete?: <T>(sql: string, sqlParams: Array<any>) => Promise<T>
  /**
   * 获取数据库中的表名
   */
  getTables: () => Promise<Array<TableInfo>>
  /**
   * 获取数据库表的字段属性
   * @param table 表名
   */
  getTablesAttribute: (table: string) => Promise<Array<TableAttributes>>
  /**
   * 插入数据
   * @param table 表名
   * @param mock
   */
  insert: (
    table: string,
    mock: Record<string, unknown> | Array<Record<string, unknown>>
  ) => Promise<unknown>
  close: () => Promise<unknown> | unknown
}
/**
 * 数据库插件
 */
interface dbPlugin {
  name: string
  uuid: string
  dbType: string
  defaultHost: string
  defaultPort: number
  version: number
  install: (connectInfo: dbConnectInfo) => baseDbAdapter
}
interface SqlParams {
  fields: Array<string>
  params: Array<Array<unknown>>
  placeHolder: Array<string>
}
function getSqlParmas(mock: Array<Record<string, unknown>>): SqlParams {
  const sql: SqlParams = {
    fields: [],
    params: [],
    placeHolder: []
  }
  const one = mock[0]
  console.log('one', one)
  sql.fields = Object.keys(one)
  console.log('fields', sql.fields)
  sql.placeHolder = Array.from({ length: sql.fields.length }, () => '?')
  mock.forEach((value) => {
    sql.params.push(Object.values(value))
  })
  console.log('插入数据：', sql)
  return sql
}
export default baseDbAdapter
export { getSqlParmas }
export type { baseDbAdapter, dbConnectInfo, dbPlugin, SqlParams }
