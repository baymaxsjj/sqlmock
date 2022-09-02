import { strict, string } from "yargs";
import useProjectStore, { ProjectTable } from "../../stores/project";
import { TableAttributes } from "../operation/TableType";
var Mock = require("mockjs");
interface anyObject{
  ['string']:any
}
class MockFactory {
  projectTable: ProjectTable;
  private successCallback: Function | undefined;
  private failCallback: Function | undefined;
  private stopCallBack: Function | undefined;
  constructor(projectTable: ProjectTable) {
    this.projectTable = projectTable;
  }
  private mockData(tableRule: Object) {
    const mockData = Mock.mock(tableRule);
    const mockStr = JSON.stringify(mockData);
    const funcStr = mockStr.replace(/{{(.*?)}}/, '"+($1)+"');
    return funcStr;
  }
  getMock():Object{
    const tableAttrs=this.projectTable.content
    let mockObj:object={}
    for(let i=0,len=tableAttrs.length;i<len;i++){
      let row=tableAttrs[i]
      if(!row.Hidden){
        mockObj[row.Field]=row.Mock
      }
    }
    return mockObj
  }
  startMock() {
    const projectStore = useProjectStore();
    const delay = this.projectTable.delay | projectStore.config.delay;
    console.log("getMock",this.getMock())

    const mockStr = this.mockData(this.getMock());
    console.log("mockStr",mockStr)
    const str = `try {
            //用户的js代码
            ${this.projectTable.runJs};
            //项目执行
            let CurrRunCount=0;
            let interval
            const runMock=()=>{
                try{
                    if(CurrRunCount==${this.projectTable.runCount}){
                        clearInterval(interval)
                        return 
                    }
                    CurrRunCount++;
                    mockThis.resolve({
                        data:${mockStr},
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
        }`;
    try {
      const runFactory = new Function("mockThis","Mock", str);
      runFactory(this,Mock);
    } catch (error) {
      this.reject(error);
    }
  }
  private resolve(value: any) {
    if (this.successCallback) {
      this.successCallback(value);
    }
  }
  private reject(reason: any) {
    if (this.failCallback) {
      this.failCallback(reason);
    }
  }
  private stop(stop: Function) {
    this.stopCallBack = stop;
  }
  then(successCallback: Function) {
    this.successCallback = successCallback;
    return this;
  }
  catch(failCallback: Function) {
    this.failCallback = failCallback;
    return this;
  }
  stopRunMock() {
    if (this.stopCallBack) {
      this.stopCallBack();
    }
  }
}
export default MockFactory;
