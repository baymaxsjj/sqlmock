import { TableDocData } from './doc-export'
import { saveAs } from 'file-saver'
import JSZip from 'jszip'
import {changeDpiDataUrl} from 'changedpi'
const dpr = window.devicePixelRatio
const shapeWidth = 240*dpr
const shapeHeight = 140*dpr
const fontSize=35*dpr
const lineColor = 'black'
const bgColor = 'white'
const lineWidth = 2*dpr
interface erElement {
  text: string
  shape: 'rectangle' | 'oval'
  centerX: number
  centerY: number
  x: number
  y: number
}

function drawEllipse(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number
) {
  ctx.beginPath()
  ctx.ellipse(x, y, width / 2, height / 2, 0, 0, Math.PI * 2)
  ctx.fillStyle = bgColor
  ctx.strokeStyle = lineColor
  ctx.fill()
  ctx.stroke()
}
const getMinCanvas = (
  canvas: HTMLCanvasElement,
  context: CanvasRenderingContext2D
): HTMLCanvasElement => {
  let imgData = context.getImageData(0, 0, canvas.width, canvas.height)
  const data = imgData.data
  let left = canvas.width
  let right = 0
  let top = canvas.height
  let bottom = 0
  for (let i = 0; i < data.length; i += 4) {
    const x = (i / 4) % canvas.width
    const y = Math.floor(i / (4 * canvas.width))
    const alpha = data[i + 3]
    if (alpha > 0) {
      left = Math.min(left, x)
      right = Math.max(right, x)
      top = Math.min(top, y)
      bottom = Math.max(bottom, y)
    }
  }
  const width = right - left
  const height = bottom - top
  const canvas1 = document.createElement('canvas')
  canvas1.width = width
  canvas1.height = height
  context = canvas1.getContext('2d')!
  context.beginPath()
  context.fillStyle = bgColor
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.stroke()
  context.drawImage(canvas, left, top, width, height, 0, 0, width, height)
  return canvas1
}

const drawText = (ctx: CanvasRenderingContext2D, text: string, x: number, y: number) => {
  ctx.beginPath()
  ctx.font = `normal 600 ${fontSize}px Arial, sans-serif`
  const textWidth = ctx.measureText(text).width
  const textHeight = parseInt(ctx.font)
  // 计算文本的位置
  let textX = x + shapeWidth / 2 - textWidth / 2
  let textY = y + shapeHeight / 2 + textHeight / 2
  ctx.fillStyle = lineColor
  ctx.fillText(text, textX, textY, shapeWidth)
  ctx.stroke()
}
const getTabelEr = (canvas:HTMLCanvasElement,table: TableDocData) => {
  //表属性个数
  const attSize = table.table_attributes.length
  //属性间隔度数
  const degree = 360 / attSize
  //计算线长
  let lineLength = Math.abs(shapeWidth/1.5 / Math.tan(((2 * Math.PI) / 360) *(degree / 2)))
  if (lineLength < shapeHeight * 2) lineLength = 2 * shapeWidth

  const centreLength = lineLength + shapeWidth

  const erEList: erElement[] = []

  let offsetDegree = 0,
    temDeg: number,
    centerX: number,
    centerY: number
  table.table_attributes.forEach((item) => {
    temDeg = ((2 * Math.PI) / 360) * offsetDegree
    ;(centerX = centreLength + Math.cos(temDeg) * lineLength),
      (centerY = centreLength + Math.sin(temDeg) * lineLength * -1),
      erEList.push({
        text: item.Comment != '' ? item.Comment : item.Field,
        shape: 'oval',
        centerX,
        centerY,
        x: centerX - shapeWidth / 2,
        y: centerY - shapeHeight / 2
      })
    offsetDegree += degree
  })
  erEList.push({
    text:
      table.table_info.table_comment != ''
        ? table.table_info.table_comment
        : table.table_info.table_name,
    shape: 'rectangle',
    centerX: centreLength,
    centerY: centreLength,
    x: centreLength - shapeWidth / 2,
    y: centreLength - shapeHeight / 2
  })
  console.log(erEList)
  //计算椭圆位置
  // const canvas = document.createElement('canvas')
  canvas.height = centreLength * 2
  canvas.width = centreLength * 2

  // canvas.style.width=centreLength*2+'px'
  // canvas.style.height=centreLength*2+'px'
  const ctx = canvas.getContext('2d')!

  ctx.clearRect(0, 0, canvas.width, canvas.height)

  erEList.forEach((shape) => {
    //画线
    ctx.beginPath()
    ctx.lineWidth = lineWidth
    ctx.strokeStyle = lineColor
    ctx.moveTo(shape.centerX, shape.centerY)
    ctx.lineTo(centreLength, centreLength)
    ctx.stroke()
    if (shape.shape == 'oval') {
      drawEllipse(ctx, shape.centerX, shape.centerY, shapeWidth, shapeHeight)
    } else {
      ctx.beginPath() //开始新的路径
      ctx.rect(shape.x, shape.y, shapeWidth, shapeHeight) //生成矩形路径，起点坐标（前两个参数）矩形大小（后两个参数）
      ctx.fillStyle = bgColor
      ctx.strokeStyle = lineColor
      ctx.fill()
      ctx.stroke() //绘制路径
    }
    // 画文字
    drawText(ctx, shape.text, shape.x, shape.y)
  })
  return getMinCanvas(canvas, ctx)
}

export const exportEr = async (name: string, data: Array<TableDocData>) => {
  let canvas: HTMLCanvasElement=document.createElement('canvas'),temCanvas:HTMLCanvasElement
  const zip = new JSZip()
  //创建一个名为folder的文件夹
  const folder = zip.folder(`${name}-ER图`)
  //再folder里面创建一个名为"文件"的txt文件，并写入hello world
  let item: TableDocData
  for (let i = 0; i < data.length; i++) {
    item = data[i]
    temCanvas = getTabelEr(canvas,item)
    // newCanvas = await html2canvas(canvas, {
    //   allowTaint: true,
    //   useCORS: true,
    //   scale: window.devicePixelRatio // 可以避免模糊
    // })
    let img = temCanvas.toDataURL()
    // const el = document.getElementById('canvas')!
    // el.innerHTML = ''
    // const picture = new Image()
    // picture.src = img
    // el.appendChild(picture)
    img = changeDpiDataUrl(img, 400);
    img = img.replace(/data:image\/\w+;base64,/, '')

    folder?.file(`${item.table_info.table_name}-ER图.png`, img, { base64: true })
  }
  //将文件压缩
  zip
    .generateAsync({
      type: 'blob'
    })
    .then((content) => {
      saveAs(content, `${name}-ER图.zip`)
    })
}
