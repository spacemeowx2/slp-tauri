import en from './en'
import zhCN from './zhCN'
import React, { createContext, useContext } from 'react'
import { useConfigInput } from '../cfg'

const langs = {
  en,
  zhCN,
}
const langKeys = Object.keys(langs)
type Langs = keyof typeof langs

const Ctx = createContext<Langs>('en')
export const useLang = () => {
  const lang = useContext(Ctx)
  return {
    t: (id: keyof typeof en) => {
      const d = langs[lang] ?? en
      const v = d[id]
      if (v !== undefined) {
        return v
      }
      // fallback to english
      return en[id]
    }
  }
}
export const LangProvider: React.FC = ({ children }) => {
  const [ lang ] = useConfigInput('language', DefaultLang)
  const v = langKeys.includes(lang) ? lang as Langs : 'en'
  return <Ctx.Provider value={v}>
    { children }
  </Ctx.Provider>
}
export const LangOptions = Object.entries(langs).map(([key, value]) => ({ key, text: value.display }))
export const DefaultLang = 'en'
