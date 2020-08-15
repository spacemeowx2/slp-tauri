/**
 * 提供tauri配置以及相关React Hooks
 */

import React, { useState, useMemo, useContext, useCallback, useEffect } from 'react'
import { writeConfig, readConfig } from '../tauri'

const ConfigCtx = React.createContext<{
  value: any
  setConfig: (key: string | number | symbol, value: any) => void
}>({
  value: {},
  setConfig: () => void 0
})

export const ConfigProvider: React.FC = ({ children }) => {
  const [ config, setConfig ] = useState({})
  const [ loading, setLoading ] = useState(true)

  useEffect(() => {
    async function save() {
      try {
        console.log('save config')
        await writeConfig(config)
        console.log('save config done')
      } catch(e) {
        console.log('save config failed', e)
      }
    }
    if (!loading) {
      const id = setTimeout(save, 500)
      return () => clearTimeout(id)
    }
  }, [ config, loading ])
  useEffect(() => {
    async function load() {
      try {
        const cfg = await readConfig()
        setConfig(cfg)
        console.log('load config done')
      } catch(e) {
        console.log('load config failed', e)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return <ConfigCtx.Provider value={useMemo(() => ({
    value: config,
    setConfig: (key, value) => setConfig(o => {
      return {
        ...o,
        [key]: value,
      }
    })
  }), [config])}>
    { loading ? <>Loading...</> : children }
  </ConfigCtx.Provider>
}

export const withType = <T extends {}>() => {
  const useConfig = (key: keyof T) => (useContext(ConfigCtx).value as T)[key]
  const useConfigInput = <K extends keyof T>(key: K, defaultValue: T[K]) => {
    const ctx = useContext(ConfigCtx)
    const v = (ctx.value as T)[key]
    const value = v === undefined ? defaultValue : v
    const onChange = useCallback((v: T[K]) => {
      ctx.setConfig(key, v)
    }, [ ctx, key ])
    useEffect(() => {
      if (v === undefined && defaultValue !== undefined) {
        onChange(defaultValue)
      }
    }, [ defaultValue, onChange, v ])
    return [ value, {
      value,
      onChange,
    }] as const
  }

  return {
    ConfigProvider,
    useConfig,
    useConfigInput,
  }
}
