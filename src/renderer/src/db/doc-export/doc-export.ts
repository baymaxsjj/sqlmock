import TableInfo, { TableAttributes } from '../operation/table-type'
import { saveAs } from 'file-saver'
import { exportMarkdown, exportWord } from './generate-doc'
export interface TableDocData {
  table_info: TableInfo
  table_attributes: Array<TableAttributes>
}
export enum DocExportType {
  WORD = 'Word',
  MARKDOWN = 'Markdown',
  ER='E-R图'
}
let worker
export class DocExport {
  download(type: DocExportType, name: string, data: Array<TableDocData>):Promise<void> {
    switch (type) {
      case DocExportType.WORD:
        return exportWord(name, '/tempalte/word_tempalte.docx', {
          data
        })
      case DocExportType.ER:
        if(worker){
          worker.terminate()
        }
        return new Promise((resolve)=>{
          worker=new Worker(new URL('./er-export.ts',import.meta.url),{
            type: 'module',
          })
          worker.postMessage(JSON.stringify({
            name,
            data,
            dpr:window.devicePixelRatio
          }))
          worker.onmessage=(msg)=>{
            saveAs(msg.data, `${name}-ER图.zip`)
            worker.terminate()
            resolve()
          }
        })
      default:
      case DocExportType.MARKDOWN:
        return exportMarkdown(name, data)
    }
  }
}
