// 表中的索引
enum TableKey {
  PRI,
  UNI,
  MUL,
  EMPTY
}
// 表的字段属性
interface TableAttributes {
  Collation: null
  Comment: string
  Default: string
  Extra: string
  Field: string
  Key: TableKey
  Null: boolean
  Privileges: string
  Type: string
  Hidden: boolean
  Mock: string
}
interface TableInfo {
  table_name: string
  table_comment: string
  create_time: string
}

export default TableInfo
export { TableKey }
export type { TableInfo, TableAttributes }
