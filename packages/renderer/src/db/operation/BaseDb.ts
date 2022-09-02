import { TableAttributes, TableName } from "./TableType";
/**
 * 数据库连接信息
 */
interface dbConnectInfo{
    type:string,
    port:number,
    host:string,
    username:string,
    password:string,
    database:string,
    other?:Object 
}
/**
 * 数据库适配器
 */
interface baseDbAdapter{
    connectInfo:dbConnectInfo, 
    /**
     * 连接数据库
     */
    connect:()=>unknown,
    /**
     * 测试数据库连接
     */
    testConn:()=>Promise<any>,
    /**
     * 查询数据库
     */
    select:<T,U>(sql:string,sqlParams:Array<any>,callback:(results:U)=>T)=>Promise<T>,
    updated?:<T>(sql:string,sqlParams:Array<any>)=>Promise<T>,
    delete?:<T>(sql:string,sqlParams:Array<any>)=>Promise<T>,
    /**
     * 获取数据库中的表名
     */
    getTables:()=>Promise<Array<TableName>>,
    /**
     * 获取数据库表的字段属性
     * @param table 表名
     */
    getTablesAttribute:(table:string)=>Promise<Array<TableAttributes>>,
    /**
     * 插入数据
     * @param table 表名
     * @param mock 
     */
    insert:(table:string,mock:object)=>Promise<any>,
}
/**
 * 数据库插件
 */
interface dbPlugin{
    name:string
    uuid:string
    dbType: string
    defaultHost: string
    defaultPort: number
    version:number
    install:(connectInfo:dbConnectInfo)=>baseDbAdapter
}
interface SqlParams{
    fields:Array<string>
    params:Array<string>
    placeHolder:Array<string>
}
function getSqlParmas( mock: object):SqlParams{
    let sql:SqlParams={
        fields: [],
        params: [],
        placeHolder: []
    }
    for(const key in mock){
        sql.fields.push(key)
        sql.placeHolder.push("?")
        sql.params.push(mock[key])
    }
    return sql;
}
export default baseDbAdapter
export{
    baseDbAdapter,
    dbConnectInfo,
    dbPlugin,
    SqlParams,
    getSqlParmas
}