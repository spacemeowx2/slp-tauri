import './global.css'
import React, { useState, useMemo, useEffect, useRef, Fragment, useCallback } from 'react'
import { render } from 'react-dom'
import { run, kill, Status, getStatus, pollOutput, getServerList, ServerListResponse, ServerItem } from './tauri'
import { ServerList } from './components/ServerList'
import { withType, ConfigProvider } from './components/Config'
import { Pivot, PivotItem, ComboBox, TextField, DefaultButton, initializeIcons, PrimaryButton } from '@fluentui/react'

initializeIcons()

interface Options {
  serverSource: string
  // 127.0.0.1:1080
  proxy: string
  server: string
}

const { useConfigInput } = withType<Options>()
const ServerListSource = [
  'https://switch-lan-play.github.io/server-list/server-list.json',
  'http://lan-play.com/data/servers.json'
]

const Log: React.FC<{ log: string[] }> = ({ log }) => {
  const box = useRef<HTMLDivElement | null>()
  useEffect(() => {
    if (box.current) {
      box.current.scrollTop = box.current.scrollHeight
    }
  }, [ log, log.length ])
  return <>
    <div ref={r => box.current = r} style={{background: '#000', height: '100%', overflowY: 'auto', overflowX: 'hidden'}}>
      <pre>
        {log.map((p, i) => <Fragment key={i}>{p}</Fragment>)}
      </pre>
    </div>
  </>
}

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

const TestData: ServerItem[] = [{
  name: 'localhost',
  ip: 'localhost',
  port: 11451,
}, {
  name: 'Test',
  ip: 'switch.lan-play.com',
  port: 11451,
}]

const Index: React.FC = () => {
  const [ err, setErr ] = useState('')
  const [ serverSource, serverSourceProps ] = useConfigInput('serverSource', ServerListSource[0])
  const [ proxy, proxyProps ] = useConfigInput('proxy', '')
  const [ server, serverProps ] = useConfigInput('server', '')
  const [ status, setStatus ] = useState<Status>({ status: 'ready' })
  const [ output, setOutput ] = useState<string[]>([])
  const [ fetch, { loading, data, error } ] = useGetServerList(serverSource)
  const appendOutput = (v: string) => {
    if (v) {
      setOutput(p => [...p, v])
    }
  }
  useEffect(() => {
    const id = setInterval(() => getStatus().then(s => setStatus(s)), 500)
    return () => clearInterval(id)
  }, [])
  useEffect(() => {
    if (status.status === 'running') {
      const id = setInterval(() => pollOutput().then(appendOutput), 500)
      return () => clearInterval(id)
    }
  }, [ status.status ])

  const commandLine = useMemo(() => {
    let argv = ['--set-ionbf']
    if (proxy) {
      argv.push('--socks5-server-addr', proxy)
    }
    if (server) {
      argv.push('--relay-server-addr', server)
    } else {
      argv.push('--relay-server-addr', '127.0.0.1:11451')
    }
    return argv
  }, [ proxy, server ])

  return <div className='window'>
    <div className='window-body'>
      <Pivot>
        <PivotItem headerText='Server'>
          { error && <p>Error: {error}</p>}
          <p>{serverSource} <DefaultButton onClick={fetch} disabled={loading}>{ loading ? 'Loading' : 'Fetch' }</DefaultButton></p>
          <ServerList serverList={data ? data.serverList : TestData} {...serverProps} />
        </PivotItem>
        <PivotItem headerText='Settings'>
          <ComboBox
            label='Server List'
            allowFreeform
            options={ServerListSource.map(i => ({key: i, text: i}))}
            selectedKey={serverSourceProps.value}
            onChange={(_, { key }) => serverSourceProps.onChange(key as string)}
          />
          <TextField
            label='Proxy'
            placeholder='127.0.0.1:1080'
            value={proxyProps.value}
            onChange={(_, v) => proxyProps.onChange(v)}
          />
          <TextField
            readOnly
            label='Debug(Current command line options:)'
            value={`lan-play ${commandLine.join(' ')}`}
          />
        </PivotItem>
        { status.status === 'running' && <PivotItem headerText='Output'>
          <Log log={output}/>
        </PivotItem> }
      </Pivot>
    </div>
    <section className='bottom'>
      { err && <p>{err}</p> }
      <PrimaryButton onClick={() => {
        if (status.status === 'ready') {
          run(commandLine).then(setStatus).then(() => setOutput([]), setErr)
        } else {
          kill().then(setStatus, setErr)
        }
      }}>{status.status === 'ready' ? 'Run' : 'Stop'}</PrimaryButton>
    </section>
  </div>
}

render(<ConfigProvider><Index /></ConfigProvider>, document.getElementById('app'))
