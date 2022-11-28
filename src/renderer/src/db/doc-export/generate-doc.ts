import PizZip from 'pizzip'
import DocxTemplater from 'docxtemplater'
import { saveAs } from 'file-saver'
import { TableDocData } from './doc-export'
import { gatRootFilePath } from '@renderer/utils/file'
export const exportWord = (save_name: string, template: string, data: any) => {
  const JSZipUtils = require('jszip-utils')
  template = gatRootFilePath(template)
  console.log(template)
  JSZipUtils.getBinaryContent(template, function (err: any, content: PizZip.LoadData) {
    if (err) {
      console.log(err)
      return
    }
    let zip = new PizZip(content)
    let doc = new DocxTemplater().loadZip(zip)
    console.log(data)
    doc.setData(data)

    try {
      doc.render()
    } catch (err) {
      console.log(err)
      return
    }

    let out = doc.getZip().generate({
      type: 'blob',
      mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    })

    saveAs(out, `${save_name}-数据库字段.docx`)
  })
}
export const exportMarkdown = (save_name: string, data: Array<TableDocData>) => {
  let text = ''
  data.forEach((row) => {
    text += `\n${row.table_info.table_name}(${row.table_info.table_comment})\n`
    text += `| **字段**      | **类型**     | **是否为Null** | **默认值**      | **描述**        |\n`
    text += `| ------------- | ------------ | -------------- | --------------- | --------------- |\n`
    row.table_attributes.forEach((attr) => {
      text += `| ${attr.Field} | ${attr.Type} | ${attr.Null}   | ${attr.Default} | ${attr.Comment} |\n`
    })
    text + '\n'
  })
  console.log(text)
  const blob = new Blob([text])
  saveAs(blob, `${save_name}-数据库字段.md`)
}
