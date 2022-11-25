import useProjectStore, { ProjectTable } from '../../stores/project'
import { MyObject } from '../operation/table-type'
const Mock = require('mockjs')
class MockFactory {
  projectTable: ProjectTable
  private successCallback: Function | undefined
  private failCallback: Function | undefined
  private stopCallBack: Function | undefined
  constructor(projectTable: ProjectTable) {
    this.projectTable = projectTable
  }
  private mockData(tableRule: Object) {
    // const mockData = Mock.mock(tableRule);
    // console.log('mockData',mockData)
    const mockStr = JSON.stringify(tableRule)
    const funcStr = mockStr.replace(/{{(.*?)}}/, '"+$1+"')
    return funcStr
  }
  getMock(): Object {
    const tableAttrs = this.projectTable.content
    const mockObj: MyObject = {}
    for (let i = 0, len = tableAttrs.length; i < len; i++) {
      const row = tableAttrs[i]
      if (!row.Hidden) {
        mockObj[row.Field] = row.Mock
      }
    }
    return mockObj
  }
  startMock() {
    const projectStore = useProjectStore()
    const delay = this.projectTable.delay ?? projectStore.config.delay
    console.log('getMock', this.getMock())
    const mockStr = this.mockData(this.getMock())
    console.log('mockStr', mockStr)
    const str = `try {
            //用户的js代码
            ${this.projectTable.runJs};
            //项目执行
            let CurrRunCount=0;
            let interval
            if(${this.projectTable.isBatch}){
              const data=[]
              for(let i=0;i<${this.projectTable.runCount};i++){
                data.push(Mock.mock(${mockStr}))
              }
              mockThis.resolve(data)
              return;
            }
            const runMock=()=>{
                try{
                    if(CurrRunCount==${this.projectTable.runCount}){
                        clearInterval(interval)
                        return 
                    }
                    CurrRunCount++;

                    mockThis.resolve({
                        data:Mock.mock(${mockStr}),
                        runCount:CurrRunCount
                    })
                } catch (error) {
                    mockThis.reject(error)
                }
            }
            runMock()
            interval=setInterval(runMock,${delay})
            mockThis.stop(()=>{
                clearInterval(interval)
            })
        } catch (error) {
            console.log(error)
            mockThis.reject(error)
        }`
    try {
      const runFactory = new Function('mockThis', 'Mock', str)
      runFactory(this, Mock)
    } catch (error) {
      this.reject(error)
    }
  }
  public resolve(value: Object) {
    if (this.successCallback) {
      this.successCallback(value)
    }
  }
  private reject(reason: unknown) {
    if (this.failCallback) {
      this.failCallback(reason)
    }
  }
  public stop(stop: Function) {
    this.stopCallBack = stop
  }
  then(successCallback: Function) {
    this.successCallback = successCallback
    return this
  }
  catch(failCallback: Function) {
    this.failCallback = failCallback
    return this
  }
  stopRunMock() {
    if (this.stopCallBack) {
      this.stopCallBack()
    }
  }
}
export default MockFactory
