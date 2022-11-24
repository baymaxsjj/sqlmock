import { defineStore, PiniaPluginContext } from 'pinia' 
import baseDbAdapter, { dbConnectInfo } from '../db/operation/BaseDb'
import dbmock from '../db/operation/Index'
import { TableAttributes } from '../db/operation/TableType'
interface ProjectType {
    project: Array<Project>, // 字段扩展声明
    config:Config

}; 
interface Config{
    delay:number
}
interface tableMock{
    [name:string]:ProjectTable
}
interface Project{
    name:string
    connInfo:dbConnectInfo
    adpterUUID:string
    tableMock:tableMock
    adapter?:baseDbAdapter
}
interface ProjectTable{
    name:string,
    content:Array<TableAttributes>,
    runJs:string,
    runCount:number,
    delay:number
}
/**
 * project
 *      name:mgo_blog
 *      connInfo:{
 *      }
 *      tableMock
 *          table
 *              id:@1234
 *              name:888888
 *              text:666666
 *          table2
 *              id:@1234
 *              name:888888
 *              text:666666
 * 
 */
const useProjectStore = defineStore({ 
    id: 'project', 
    state: ():ProjectType =>({
        project:[],
        config:{
            delay:100
        }
    }),
    persist: {
        beforeRestore: (context: PiniaPluginContext) => {
            console.log(context)
            console.log(context.store.$state.project)
        },
        afterRestore: (context: PiniaPluginContext) => {
            context.store.delAllAdapter()
            console.log(context.store.$state.project)
        },
    },
    actions:{
        async addProject(name:string,uuid:string,connInfo:dbConnectInfo){
            const project:Project={
                name: name,
                connInfo: connInfo,
                tableMock: {},
                adpterUUID: uuid
            }
            this.delProjectByName(name)
            this.project.unshift(project)
        },
        async updatedProject(project:Project) {
            console.log(project)
            const index=this.getProjectIndex(project.name)
            this.project.splice(index,1,project)
            console.log( this.project[index])
        },
        delProjectByName(name:string):void{
            let index=this.getProjectIndex(name)
            if(index!=-1){
                for(let i=index,len=this.project.length;i<len;i++){
                    this.project[i]=this.project[i+1]
                 }
                 this.project.length--;
            }
        },
        getProjectByName(name:string):Project{
            const index=this.getProjectIndex(name)
            console.log(index)
            return this.project[index]
        },
        getProjectIndex(name:string):number{
            for (let i=0,len=this.project.length;i<len;i++) {
                if(this.project[i].name==name){
                    return i;
                }
            }
            return -1;
        },
        getProjectDbAdapter(name:string):baseDbAdapter{
            const index=this.getProjectIndex(name)
            const project=this.project[index]
            if(project.adapter){
                return project.adapter
            }else {
                const adapter=dbmock.getAdapterByUuid(project.adpterUUID,project.connInfo)
                project.adapter=adapter
                return adapter
            }
        },
        delAllAdapter(){
            for(let i=0,len=this.project.length;i<len;i++){
                delete this.project[i].adapter
            }
        }
    },
    getters:{
        getProjects():Array<Project>{
            return this.project
        }
    }
}) 
export default useProjectStore
export {
    Project,
    ProjectTable
}