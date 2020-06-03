import React, { useEffect } from 'react'
// @ts-ignore
import css98 from 'bundle-text:xp.css/dist/98.css'
// @ts-ignore
import cssxp from 'bundle-text:xp.css/dist/XP.css'
// @ts-ignore
import globalCss from 'bundle-text:./global.css'

insertStyle(globalCss)

export function insertStyle(css: string) {
  const head = document.head
  const style = document.createElement('style')
  head.appendChild(style)
  style.type = 'text/css'
  style.appendChild(document.createTextNode(css))
  return () => {
    head.removeChild(style)
  }
}

export type Theme = 'xp' | '98'
export const ThemeProvider: React.FC<{ theme: Theme }> = ({ theme, children }) => {
  useEffect(() => {
    if (theme === 'xp') {
      return insertStyle(cssxp)
    } else {
      return insertStyle(css98)
    }
  }, [ theme ])
  return <>
    { children }
  </>
}
