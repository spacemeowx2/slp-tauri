import React, { useState, useCallback } from 'react'
import { DefaultButton, PrimaryButton, TextField } from '@fluentui/react'
import { ServerList } from '../components/ServerList'
import { getServerList, ServerItem } from '../tauri'
import { useConfigInput, ServerListSource } from '../cfg'
import { useLang } from '../lang'
import { useDialog } from '../components/Dialog'
import { useInput, useInputWithRule } from '../hooks'

const AddBtn: React.FC<{ onAdd: (server: ServerItem) => void }> = ({ onAdd }) => {
  const RE = /^([^:]+):(\d{1,5})$/
  const [ name, nameProps ] = useInput('')
  const [ address, addressProps ] = useInputWithRule('', RE, 'Invalid address. Example: switch.lan-play.com:11451')
  const { t } = useLang()
  const { dialog, open } = useDialog({
    title: t('add-server'),
    body: <>
      <TextField label={t('server-name')} {...nameProps} />
      <TextField label={t('server-address')} {...addressProps} />
    </>,
    disabled: !name || !address || !RE.test(address),
    onOK: () => {
      const [, ip, port] = RE.exec(address)
      onAdd({
        name,
        ip,
        port: parseInt(port, 10),
      })
    }
  })

  return <>
    <PrimaryButton onClick={open}>{t('add')}</PrimaryButton>
    { dialog }
  </>
}

export const Server: React.FC = () => {
  const [ serverSource ] = useConfigInput('serverSource', ServerListSource[0])
  const [ error, setError ] = useState(undefined)
  const [ loading, setLoading ] = useState(false)
  // const [ fetch, { loading, data, error } ] = useGetServerList(serverSource)
  const fetchRemote = useCallback(async (url: string) => {
    try {
      setLoading(true)
      const resp = await getServerList(url)
      return resp.serverList
    } catch(e) {
      setError(e)
    } finally {
      setLoading(false)
    }
  }, [])
  const [ , serverProps ] = useConfigInput('server', '')
  const { t } = useLang()
  const [ localServer, { onChange: setLocalServer } ] = useConfigInput('localServer', [])
  const [ remoteServer, { onChange: setRemoteServer } ] = useConfigInput('remoteServer', [])
  const serverList = [...localServer, ...remoteServer]
  const addServer = (server: ServerItem) => {
    setLocalServer([server, ...localServer])
  }

  return <>
    { error && <>{String(error)}</>}
    <AddBtn onAdd={addServer} />
    <p><DefaultButton onClick={async () => {
      const list = await fetchRemote(serverSource)
      setRemoteServer(list)
    }} disabled={loading}>{ loading ? t('loading') : t('fetch') }</DefaultButton></p>
    <ServerList serverList={serverList} {...serverProps} />
  </>
}
