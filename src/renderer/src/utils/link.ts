import { shell } from 'electron'
export const toLink = (href) => {
  shell.openExternal(href)
}
