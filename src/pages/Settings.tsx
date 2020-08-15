import React from 'react'
import { ComboBox, TextField, Dropdown } from '@fluentui/react'
import { ServerListSource, useConfigInput } from '../cfg'
import { useLang, LangOptions, DefaultLang } from '../lang'

export const Settings: React.FC = () => {
  const [ , serverSourceProps ] = useConfigInput('serverSource', ServerListSource[0])
  const [ , proxyProps ] = useConfigInput('proxy', '')
  const [ , languageProps ] = useConfigInput('language', DefaultLang)
  const { t } = useLang()

  return <>
    <Dropdown
      label={t('language')}
      options={LangOptions}
      selectedKey={languageProps.value}
      onChange={(_, { key }) => languageProps.onChange(key as string)}
    />
    <ComboBox
      label={t('server-list')}
      allowFreeform
      options={ServerListSource.map(i => ({key: i, text: i}))}
      selectedKey={serverSourceProps.value}
      onChange={(_, { key }) => serverSourceProps.onChange(key as string)}
    />
    <TextField
      label={t('proxy')}
      placeholder='127.0.0.1:1080'
      value={proxyProps.value}
      onChange={(_, v) => proxyProps.onChange(v)}
    />
  </>
}
