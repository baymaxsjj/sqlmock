import TableInfo, { TableAttributes } from '../operation/table-type'
import { exportMarkdown, exportWord } from './generate-doc'
export interface TableDocData {
  table_info: TableInfo
  table_attributes: Array<TableAttributes>
}
export enum DocExportType {
  WORD = 'Word',
  MARKDOWN = 'Markdown'
}
export class DocExport {
  download(type: DocExportType, name: string, data: Array<TableDocData>) {
    switch (type) {
      case DocExportType.WORD:
        exportWord(name, '/tempalte/word_tempalte.docx', {
          data
        })
        break
      default:
      case DocExportType.MARKDOWN:
        exportMarkdown(name, data)
    }
  }
}
