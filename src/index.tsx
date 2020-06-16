import React, { useState, useMemo, useEffect, useRef, Fragment, useCallback } from 'react'
import { render } from 'react-dom'
import { ThemeProvider, Theme } from './css'
import { Tabs } from './components/Tabs'
import { useInput } from './hooks'
import { Select } from './components/Select'
import { run, kill, Status, getStatus, pollOutput, getServerList, ServerListResponse, ServerItem } from './tauri'
import { Input } from './components/Input'
import { ServerList } from './components/ServerList'

const ServerListSource = [
  'https://switch-lan-play.github.io/server-list/server-list.json',
]

interface Options {
  enableProxy: boolean
  // 127.0.0.1:1080
  proxy?: string
}

const Log: React.FC<{ log: string[] }> = ({ log }) => {
  const box = useRef<HTMLDivElement | null>()
  useEffect(() => {
    if (box.current) {
      box.current.scrollTop = box.current.scrollHeight
    }
  }, [ log, log.length ])
  return <>
    <div ref={r => box.current = r} style={{maxHeight: 500, overflowY: 'auto', overflowX: 'hidden'}}>
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
      .then(setData, setError)
      .then(() => setLoading(false))
  }, [ url ])
  return [fetch, {
    data,
    loading,
    error,
  }] as const
}

const TestData: ServerItem[] = [{
  name: 'Test',
  ip: 'switch.lan-play.com',
  port: 11451
}]

const Index: React.FC = () => {
  const [ err, setErr ] = useState('')
  const [ theme, themeProps ] = useInput('xp')
  const [ serverSource, serverSourceProps ] = useInput(ServerListSource[0])
  const [ proxy, proxyProps ] = useInput('')
  const [ server, serverProps ] = useInput('')
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

render(<Index />, document.body)
