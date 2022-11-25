import baseDbAdapter, { dbConnectInfo, dbPlugin, SqlParams } from "../baseDb";
import TableName, { TableAttributes, TableKey } from "../TableType";
import { MysqlTableAttributes } from "./MysqlAdapter";
const { Sequelize,QueryTypes } = require('sequelize');
class SequelizeAdapter implements baseDbAdapter{
    connectInfo: dbConnectInfo;
    sequelize:any
    queryTypes=QueryTypes.SELECT
    constructor(connectInfo: dbConnectInfo) {
        this.connectInfo = connectInfo
        this.connect()
    }
    close(){
        
    };
    updated?: (<T>(sql: string, sqlParams: any[]) => Promise<T>) | undefined;
    delete?: (<T>(sql: string, sqlParams: any[]) => Promise<T>) | undefined;
    connect():any{
        this.sequelize = new Sequelize(this.connectInfo.database, this.connectInfo.username,this.connectInfo.password, {
            host: this.connectInfo.host,
            dialect: this.connectInfo.type/* 选择 'mysql' | 'mariadb' | 'postgres' | 'mssql' 其一 */
        });
        return this.sequelize
    };
    testConn():Promise<any>{
        return new Promise(async (resolve, reject)=>{
            try {
                await this.sequelize.authenticate();
                resolve("successfully")
              } catch (error) {
                reject(error)
              }
        })
    }
    async select<T, U>(sql: string, sqlParams: any[], callback: (results: U) => T) :Promise<T>{
        console.log("queryTypes",this.queryTypes)
        const promise = new Promise<T>((resolve, reject) => {
            this.connect().query(sql,{
                replacements:sqlParams,
                // type:this.queryTypes
            }).then((results: Array<U>)=>{
                console.log(results)
                resolve(callback(results[0]))
            }).catch((error:unknown)=>{
                console.log(error)
                reject(error)
            })
        })
        return promise;
// 结果将是一个空数组,元数据将包含受影响的行数.
    };
    async getTables(): Promise<Array<TableName>> {
        this.queryTypes=QueryTypes.SELECT
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
        this.queryTypes=QueryTypes.SELECT
        const sql = `show full columns from ` + table;
        const prom =await this.select<Array<TableAttributes>, Array<MysqlTableAttributes>>(sql, [this.connectInfo.database], this.formatTableAttr)
        return prom;
    }
    async insert(table: string, mock: object): Promise<any> {
        const sql=`insert into ${table} values()`
        return this.select<any,any>(sql,[],()=>{

        })
    }
}
class SequelizePlugin implements dbPlugin {
    uuid: string="baymax.seque.mysql";
    name: string="Mysql2"
    dbType: string = "mysql";
    defaultHost: string = "localhost";
    defaultPort: number = 3306;
    version: number = 1;
    install(connectInfo: dbConnectInfo): baseDbAdapter {
        connectInfo.type=this.dbType
        return new SequelizeAdapter(connectInfo)
    };
}
export default SequelizePlugin