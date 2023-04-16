export {}

declare global {
  interface Window {
    removeLoading: () => void
  }
  interface OffscreenCanvas{
    convertToBlob:({type:string,quality:number})=>Blob
  }
  class FileReaderSync{
    readAsDataURL:(Blob)=>string
  }
}
