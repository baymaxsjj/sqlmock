import path from 'path'

export function gatRootFilePath(root_path: string) {
  if (import.meta.env.PROD) {
    return path.resolve(__dirname, '.' + root_path)
  }
  return root_path
}
