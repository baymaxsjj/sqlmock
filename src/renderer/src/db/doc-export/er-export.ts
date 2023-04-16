import { TableDocData } from './doc-export'
import JSZip from 'jszip'

interface erElement {
  text: string
  shape: 'rectangle' | 'oval'
  centerX: number
  centerY: number
  x: number
  y: number
}
let shapeWidth = 240 
let shapeHeight = 140
let lineWidth = 2 
let fontSize = 35

const lineColor = 'black'
const bgColor = 'white'

function drawEllipse(
  ctx: OffscreenCanvasRenderingContext2D,
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
const getMinCanvas = (canvas: OffscreenCanvas): OffscreenCanvas => {
  let context = canvas.getContext('2d')! as OffscreenCanvasRenderingContext2D
  const data = context.getImageData(0, 0, canvas.width, canvas.height).data
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
  const canvas1 = new OffscreenCanvas(width, height)
  context = canvas1.getContext('2d')! as OffscreenCanvasRenderingContext2D
  context.beginPath()
  context.fillStyle = bgColor
  context.fillRect(0, 0, canvas.width, canvas.height)
  context.stroke()
  context.drawImage(canvas, left, top, width, height, 0, 0, width, height)
  return canvas1
}

const drawText = (ctx: OffscreenCanvasRenderingContext2D, text: string, x: number, y: number) => {
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
const getTabelEr = (table: TableDocData) => {
  //表属性个数
  const attSize = table.table_attributes.length
  //属性间隔度数
  const degree = 360 / attSize
  //计算线长
  let lineLength = Math.abs(shapeWidth / 1.5 / Math.tan(((2 * Math.PI) / 360) * (degree / 2)))
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
  //计算椭圆位置
  const canvas = new OffscreenCanvas(centreLength * 2, centreLength * 2)
  // canvas.style.width=centreLength*2+'px'
  // canvas.style.height=centreLength*2+'px'
  const ctx = canvas.getContext('2d')! as OffscreenCanvasRenderingContext2D

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
  return getMinCanvas(canvas)
}

export const exportEr = async (data: Array<TableDocData>) => {
  let temCanvas: OffscreenCanvas
  const zip = new JSZip()
  //创建一个名为folder的文件夹
  // const folder = zip.folder(`${name}-ER图`)
  //再folder里面创建一个名为"文件"的txt文件，并写入hello world
  let item: TableDocData
  let start = Date.now()
  for (let i = 0; i < data.length; i++) {
    item = data[i]
    temCanvas = getTabelEr(item)
    let imgBlob = await temCanvas!.convertToBlob({
      type:'image/png',
      quality:1
    })
    let reader = new FileReaderSync();
    let result=await reader.readAsDataURL(imgBlob) as string;
    console.log(result)
    // img = reader.result? as string .replace(/data:image\/\w+;base64,/, '')
    zip?.file(`${item.table_info.table_name}-ER图.png`,result.split(',')[1] , { base64: true })
    // img = changeDpiDataUrl(img, 400)
  }
  let end = Date.now()
  console.log('er图耗时：', end - start)
  //将文件压缩
  zip
    .generateAsync({
      type: 'blob'
    })
    .then((content) => {
      postMessage(content)
    })
}
self.onmessage=(msg)=>{
  console.log(msg)
  const data=JSON.parse(msg.data)
  shapeHeight*=data.dpr
  shapeWidth*=data.dpr
  fontSize*=data.dpr
  lineWidth*=data.dpr
  exportEr(data.data)
}