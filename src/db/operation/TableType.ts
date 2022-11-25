// 表名
interface TableName{
    table_name:string
}
// 表中的索引
enum TableKey{
    PRI,
    UNI,
    MUL,
    EMPTY
}
// 表的字段属性
interface TableAttributes{
    Collation: null
    Comment: string
    Default: string
    Extra: string
    Field: string
    Key: TableKey
    Null: boolean
    Privileges: string
    Type: string,
    Hidden:boolean,
    Mock:string
}

interface RandomKey {
    [propName: string]: string
}
interface MyObject {
    [key: string]: string
}

export default TableName
export{
    TableName,
    TableAttributes,
    TableKey,
    RandomKey,
    MyObject
}