import { defineStore, PiniaPluginContext } from 'pinia'
import baseDbAdapter, { dbConnectInfo } from '../db/operation/base-db'
import dbmock from '../db/operation'
import { TableAttributes } from '../db/operation/table-type'
interface ProjectType {
  project: Array<Project> // 字段扩展声明
  config: Config
}
interface Config {
  delay: number
}
interface tableMock {
  [name: string]: ProjectTable
}
interface Project {
  id?: string
  name: string
  connInfo: dbConnectInfo
  adpterUUID: string
  tableMock: tableMock
  adapter?: baseDbAdapter
}
interface ProjectTable {
  name: string
  content: Array<TableAttributes>
  runJs: string
  runCount: number
  delay: number
  isBatch: boolean
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
  state: (): ProjectType => ({
    project: [],
    config: {
      delay: 100
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
    }
  },
  actions: {
    async addProject(name: string, uuid: string, connInfo: dbConnectInfo) {
      const project: Project = {
        id: Date.now().toString(),
        name: name,
        connInfo: connInfo,
        tableMock: {},
        adpterUUID: uuid
      }
      this.project.unshift(project)
    },

    async updatedProjectById(project: Project) {
      console.log(project)
      const index = this.getProjectIndex(project.id!)
      this.project.splice(index, 1, project)
      console.log(this.project[index])
    },
    delProjectById(id: string): void {
      const index = this.getProjectIndex(id)
      if (index != -1) {
        for (let i = index, len = this.project.length; i < len; i++) {
          this.project[i] = this.project[i + 1]
        }
        this.project.length--
      }
    },
    getProjectById(id: string): Project {
      const index = this.getProjectIndex(id)
      console.log(index)
      return this.project[index]
    },

    getProjectIndex(id: string): number {
      for (let i = 0, len = this.project.length; i < len; i++) {
        if (this.project[i].id == id) {
          return i
        }
      }
      return -1
    },
    getProjectDbAdapter(id: string): baseDbAdapter {
      const index = this.getProjectIndex(id)
      console.log('项目索引', index)
      const project = this.project[index]
      if (project.adapter) {
        return project.adapter
      } else {
        const adapter = dbmock.getAdapterByUuid(project.adpterUUID, project.connInfo)
        project.adapter = adapter
        return adapter
      }
    },
    delAllAdapter() {
      for (let i = 0, len = this.project.length; i < len; i++) {
        delete this.project[i].adapter
      }
    }
  },
  getters: {
    getProjects(): Array<Project> {
      return this.project
    }
  }
})
export default useProjectStore
export type { Project, ProjectTable }
