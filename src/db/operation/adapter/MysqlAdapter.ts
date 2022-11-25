import baseDbAdapter, { dbConnectInfo, dbPlugin, getSqlParmas } from "../BaseDb";
import TableName, { TableAttributes, TableKey } from "../TableType";
let mysql = require('mysql');

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

class MysqlAdapter implements baseDbAdapter {
    connectInfo: dbConnectInfo
    constructor(connectInfo: dbConnectInfo) {
        this.connectInfo = connectInfo
        console.warn("请勿频繁创建适配器")
    }
    close():any{
        
    }
    connectPool: any
    updated?: (<T>(sql: string, sqlParams: any[]) => Promise<T>) | undefined;
    delete?: (<T>(sql: string, sqlParams: any[]) => Promise<T>) | undefined;
    connect(): any {
        // if(this.connectPool){
        //     return this.connectPool
        // }
        console.warn("创建连接池")
        let connectPool =mysql.createPool({
            host: this.connectInfo.host,
            port:this.connectInfo.port,
            user: this.connectInfo.username,
            password: this.connectInfo.password,
            database: this.connectInfo.database,
            connectionLimit: 20,//"指定连接池中最大的链接数，默认是10",
            multipleStatements: true,//"是否运行执行多条sql语句，默认值为false"
        });
        // this.connectPool=connectPool
        return connectPool;
    }
    select<T, U>(sql: string, sqlParams: Array<any>, callback: (results: U) => T): Promise<T> {
        console.log("执行参数",sqlParams)
        const promise = new Promise<T>((resolve, reject) => {
            this.connect().getConnection((err:any,connect:any)=>{
                if (err) {
                    console.log(`数据库连接失败:${err.message}`);
                    reject(err)
                }
                connect.query(sql, sqlParams, function (error: unknown, results: U, fields: unknown) {
                    if (error) reject(error)
                    console.log(results)
                    connect.release();
                    resolve(callback(results))
                });
            })

        })
        return promise;
    }
    testConn(): Promise<any> {
        return this.getTables()
    }
    async getTables(): Promise<Array<TableName>> {
        const sql = "select table_name from information_schema.tables where table_schema=?"
        const prom =await this.select<Array<TableName>, Array<TableName>>(sql, [this.connectInfo.database], (res: Array<TableName>): Array<TableName> => {
            return res;
        })
        return prom;
    }
    formatTableAttr(attr: Array<MysqlTableAttributes>): Array<TableAttributes> {
        let arr: Array<TableAttributes> = []
        for (let i = 0; i < attr.length; i++) {
            let item = attr[i]
            let key:TableKey;
            switch(item.Key){
                case 'PRI':
                    key=TableKey.PRI
                    break
                case 'UNI':
                    key=TableKey.UNI
                    break
                case 'MUL':
                    key=TableKey.MUL
                    break
                default: key=TableKey.EMPTY
            }
            let newItem: TableAttributes={
                Collation:  item.Collation,
                Comment:    item.Comment,
                Default:    item.Default,
                Extra:      item. Extra,
                Field:      item.Field,
                Key:        key,
                Null:       item.Null=="YES",
                Privileges: item.Privileges,
                Type:       item.Type,
                Hidden:false,
                Mock:""
            };
            arr[i]=newItem
        }
        console.log(arr)
        return arr

    }
    async getTablesAttribute(table: string): Promise<Array<TableAttributes>> {
        const sql = `show full columns from ` + table;
        const prom =await this.select<Array<TableAttributes>, Array<MysqlTableAttributes>>(sql, [this.connectInfo.database], this.formatTableAttr)
        return prom;
    }
    
    async insert(table: string, mock: object|Array<object>): Promise<any> {
        // return
        let data:Array<Object>=[]
        if(mock instanceof Array){
            data=mock
        }else{
            data.push(mock)
        }
        console.log('插入数据：',data)
        const sqlParams=getSqlParmas(data)
        const sql=`INSERT INTO ${table}(${sqlParams.fields.toString()}) VALUES ?`
        console.log("sql",sql)
        return this.select<any,any>(sql,[sqlParams.params],(res)=>{
            return res
        })  
    }
}
class MysqlPlugin implements dbPlugin {
    uuid: string="baymax.mysql";
    name: string="Mysql"
    dbType: string = "mysql";
    defaultHost: string = "localhost";
    defaultPort: number = 3306;
    version: number = 1;
    install(connectInfo: dbConnectInfo): baseDbAdapter {
        connectInfo.type=this.dbType
        return new MysqlAdapter(connectInfo)
    };
}
export default MysqlPlugin
export {
    MysqlTableAttributes
}