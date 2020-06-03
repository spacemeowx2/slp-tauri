// @ts-ignore
import css98 from 'bundle-text:98.css'

function insertStyle(css: string) {
  const head = document.head
  const style = document.createElement('style')
  head.appendChild(style)
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
}
insertStyle(css98)
