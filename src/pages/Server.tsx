import React, { useState, useCallback } from 'react'
import { DefaultButton } from '@fluentui/react'
import { ServerList } from '../components/ServerList'
import { ServerItem, ServerListResponse, getServerList } from '../tauri'
import { useConfigInput, ServerListSource } from '../cfg'
import { useLang } from '../lang'

const TestData: ServerItem[] = [{
  name: 'localhost',
  ip: 'localhost',
  port: 11451,
}, {
  name: 'Test',
  ip: 'switch.lan-play.com',
  port: 11451,
}]

const useGetServerList = (url: string) => {
  const [ loading, setLoading ] = useState(false)
  const [ data, setData ] = useState<ServerListResponse>(undefined)
  const [ error, setError ] = useState(undefined)
  const fetch = useCallback(() => {
    setError(undefined)
    setLoading(true)
    getServerList(url)
      .then(setData, (e) => {
        console.error(e)
        setError(e.toString())
      })
      .then(() => setLoading(false))
  }, [ url ])
  return [fetch, {
    data,
    loading,
    error,
  }] as const
}

export const Server: React.FC = () => {
  const [ serverSource ] = useConfigInput('serverSource', ServerListSource[0])
  const [ fetch, { loading, data, error } ] = useGetServerList(serverSource)
  const [ , serverProps ] = useConfigInput('server', '')
  const { t } = useLang()
  return <>
    { error && <p>Error: {error}</p>}
    <p>{serverSource} <DefaultButton onClick={fetch} disabled={loading}>{ loading ? t('loading') : t('fetch') }</DefaultButton></p>
    <ServerList serverList={data ? data.serverList : TestData} {...serverProps} />
  </>
}
