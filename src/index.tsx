import React, { useState, useMemo, useEffect, useRef, Fragment, useCallback } from 'react'
import { render } from 'react-dom'
import { ThemeProvider, Theme } from './css'
import { Tabs } from './components/Tabs'
import { Select } from './components/Select'
import { run, kill, Status, getStatus, pollOutput, getServerList, ServerListResponse, ServerItem } from './tauri'
import { Input } from './components/Input'
import { ServerList } from './components/ServerList'
import { withType, ConfigProvider } from './components/Config'

interface Options {
  serverSource: string
  theme: string
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
      <pre style={{height: '100%'}}>
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
  const [ theme, themeProps ] = useConfigInput('theme', 'xp')
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

  return <ThemeProvider theme={theme as Theme}>
    <div style={{ height: '100%', margin: '0'}} className='window'>
      <div className='title-bar'>
        <div className='title-bar-text'>Switch Lan Play</div>
      </div>

      <div className='window-body'>
        <Tabs>
          <Tabs.Item id='Server'>
            { error && <p>Error: {error}</p>}
            <p>{serverSource} <button onClick={fetch} disabled={loading}>{ loading ? 'Loading' : 'Fetch' }</button></p>
            <ServerList serverList={data ? data.serverList : TestData} {...serverProps} />
          </Tabs.Item>
          <Tabs.Item id='Settings'>
            <fieldset>
              <legend>Theme</legend>
              <label>Select a theme</label>
              <Select options={['98', 'xp']} {...themeProps}/>
            </fieldset>
            <fieldset>
              <legend>Server list</legend>
              <label>Load server list from</label>
              <Select options={ServerListSource} {...serverSourceProps}/>
            </fieldset>
            <fieldset>
              <legend>Proxy</legend>
              <p>You can set proxy here. Leave it empty to disable proxy.</p>
              <p>Example: 127.0.0.1:1080</p>
              <div className='field-row'>
                <label>Proxy: </label>
                <Input {...proxyProps} placeholder='Write proxy here' />
              </div>
            </fieldset>
            <fieldset>
              <legend>Debug</legend>
              <label>Current command line options:</label>
              <p>lan-play {commandLine.join(' ')}</p>
            </fieldset>
          </Tabs.Item>
          <Tabs.Item id='Output' hidden={status.status !== 'running'}>
            <Log log={output}/>
          </Tabs.Item>
        </Tabs>
        <section className='field-row' style={{ justifyContent: 'flex-end' }}>
          <p>{err}</p>
          <button onClick={() => {
            if (status.status === 'ready') {
              run(commandLine).then(setStatus).then(() => setOutput([]), setErr)
            } else {
              kill().then(setStatus, setErr)
            }
          }}>{status.status === 'ready' ? 'Run' : 'Stop'}</button>
        </section>
      </div>
    </div>
  </ThemeProvider>
}

render(<ConfigProvider><Index /></ConfigProvider>, document.body)
