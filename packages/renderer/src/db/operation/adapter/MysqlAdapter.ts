import baseDbAdapter, { dbConnectInfo, dbPlugin, getSqlParmas } from "../BaseDb";
import TableName, { TableAttributes, TableKey } from "../TableType";
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
    }
    connect(): any {
        let mysql = require('mysql');
        const connection = mysql.createConnection({
            host: this.connectInfo.host,
            user: this.connectInfo.username,
            password: this.connectInfo.password,
            database: this.connectInfo.database
        });
        connection.connect();
        console.log(this.connectInfo)
        return connection;
    }
    select<T, U>(sql: string, sqlParams: Array<any>, callback: (results: U) => T): Promise<T> {
        const promise = new Promise<T>((resolve, reject) => {
            this.connect().query(sql, sqlParams, function (error: unknown, results: U, fields: unknown) {
                if (error) reject(error)
                console.log(results)
                resolve(callback(results))
            });
            this.connect().end();
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
    
    async insert(table: string, mock: object): Promise<any> {
        const sqlParams=getSqlParmas(mock)
        const sql=`insert into ${table}(${sqlParams.fields.toString()}) values (${sqlParams.placeHolder.toString()})`
        console.log("sql",sql,sql,sqlParams)
        return this.select<any,any>(sql,sqlParams.params,(res)=>{
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