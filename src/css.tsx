// @ts-ignore
import css98 from 'bundle-text:98.css'
// @ts-ignore
import cssxp from 'bundle-text:xp.css'
// @ts-ignore
import globalCss from 'bundle-text:./global.css'

insertStyle(globalCss)

function insertStyle(css: string) {
  const head = document.head
  const style = document.createElement('style')
  head.appendChild(style)
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
}
const theme: 'xp' | '98' = 'xp'
if (theme === 'xp') {
  insertStyle(cssxp)
} else {
  insertStyle(css98)
}
