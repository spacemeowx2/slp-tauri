import React, { useState, useCallback } from 'react'
import { DefaultButton, PrimaryButton, TextField, Stack } from '@fluentui/react'
import { ServerList, key } from '../components/ServerList'
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
const DelBtn: React.FC<{ onDel: () => void, disabled: boolean }> = ({ onDel, disabled }) => {
  const { t } = useLang()
  const { dialog, open } = useDialog({
    title: t('del-server'),
    subText: t('del-server-confirm'),
    onOK: () => {
      onDel()
    }
  })

  return <>
    <DefaultButton disabled={disabled} onClick={open}>{t('del')}</DefaultButton>
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
  const [ server, serverProps ] = useConfigInput('server', '')
  const { t } = useLang()
  const [ localServer, { onChange: setLocalServer } ] = useConfigInput('localServer', [])
  const [ remoteServer, { onChange: setRemoteServer } ] = useConfigInput('remoteServer', [])
  const serverList = [...localServer, ...remoteServer]
  const addServer = (server: ServerItem) => {
    setLocalServer([server, ...localServer])
  }
  const delServer = () => {
    setLocalServer(localServer.filter(i => key(i) !== server))
    setRemoteServer(remoteServer.filter(i => key(i) !== server))
    serverProps.onChange('')
  }

  return <>
    { error && <>{String(error)}</>}
    <Stack horizontal tokens={{ childrenGap: 10 }}>
      <AddBtn onAdd={addServer} />
      <DelBtn onDel={delServer} disabled={server === ''} />
      <DefaultButton onClick={async () => {
        const list = await fetchRemote(serverSource)
        setRemoteServer(list)
      }} disabled={loading}>{ loading ? t('loading') : t('fetch') }</DefaultButton>
    </Stack>
    <ServerList serverList={serverList} {...serverProps} />
  </>
}
