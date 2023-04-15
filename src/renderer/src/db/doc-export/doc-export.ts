import TableInfo, { TableAttributes } from '../operation/table-type'
import { exportEr } from './er-export'
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
export class DocExport {
  download(type: DocExportType, name: string, data: Array<TableDocData>):Promise<void> {
    switch (type) {
      case DocExportType.WORD:
        return exportWord(name, '/tempalte/word_tempalte.docx', {
          data
        })
      case DocExportType.ER:
        return exportEr(name,data)
      default:
      case DocExportType.MARKDOWN:
        return exportMarkdown(name, data)
    }
  }
}
