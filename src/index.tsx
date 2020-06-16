import React, { useState, useMemo, useEffect, useRef, Fragment } from 'react'
import { render } from 'react-dom'
import { ThemeProvider, Theme } from './css'
import { Tabs } from './components/Tabs'
import { useInput } from './hooks'
import { Select } from './components/Select'
import { myCustomCommand, run, kill, Status, getStatus, pollOutput } from './tauri'
import { Input } from './components/Input'

interface Options {
  enableProxy: boolean
  // 127.0.0.1:1080
  proxy?: string
}

const Log: React.FC<{ log: string[] }> = ({ log }) => {
  const box = useRef<HTMLDivElement | null>()
  useEffect(() => {
    if (box.current) {
      box.current.scrollTo(0, box.current.scrollHeight)
    }
  }, [ log, log.length ])
  return <>
    <div ref={r => box.current = r} style={{maxHeight: 200, overflowY: 'auto', overflowX: 'hidden'}}>
      <pre>
        {log.map((p, i) => <Fragment key={i}>{p}</Fragment>)}
      </pre>
    </div>
  </>
}

const Index: React.FC = () => {
  const [ count, setCount ] = useState(0)
  const [ msg, setMsg ] = useState('msg')
  const [ theme, themeProps ] = useInput('xp')
  const [ proxy, proxyProps ] = useInput('')
  const [ server, serverProps ] = useInput('')
  const [ status, setStatus ] = useState<Status>({ status: 'ready' })
  const [ output, setOutput ] = useState<string[]>([])
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
        <div className='title-bar-controls'>
          <button aria-label='Minimize'></button>
          <button aria-label='Close'></button>
        </div>
      </div>

      <div className='window-body'>
        <Tabs>
          <Tabs.Item id='Server'>
            <Select options={['127.0.0.1:11451', 'home.imspace.cn:11451']} {...serverProps}/>
            <p style={{ textAlign: 'center' }}>Current count: {count}</p>
            <p style={{ textAlign: 'center' }}>{msg}</p>
            <div className='field-row' style={{ justifyContent: 'center' }}>
              <button onClick={() => setCount(count + 1)}>+</button>
              <button onClick={() => setCount(count - 1)}>-</button>
              <button onClick={() => setCount(0)}>0</button>
              <button onClick={async () => {
                try {
                  setMsg('myCustomCommand')
                  let result = await myCustomCommand(count.toString())
                  setMsg('result ' + JSON.stringify(result))
                } catch (e) {
                  setMsg('error ' + e.toString())
                }
              }}>myCustomCommand</button>
            </div>
          </Tabs.Item>
          <Tabs.Item id='Settings'>
            <fieldset>
              <legend>Theme</legend>
              <label>Select a theme</label>
              <Select options={['98', 'xp']} {...themeProps}/>
            </fieldset>
            <fieldset>
              <legend>Proxy</legend>
              <p>You can set proxy here. Leave it empty to disable proxy.</p>
              <p>Example: 127.0.0.1:1080</p>
              <div className='field-row'>
                <label>Proxy: </label>
                <Input {...proxyProps} />
              </div>
            </fieldset>
            <fieldset>
              <legend>Debug</legend>
              <label>Current command line options:</label>
              <p>lan-play {commandLine.join(' ')}</p>
            </fieldset>
          </Tabs.Item>
          { status.status === 'running' && <Tabs.Item id='Output'>
            <Log log={output}/>
          </Tabs.Item>}
        </Tabs>
        <section className='field-row' style={{ justifyContent: 'flex-end' }}>
          <p>{status}</p>
          <button onClick={() => {
            if (status.status === 'ready') {
              run(commandLine).then(setStatus).then(() => setOutput([]))
            } else {
              kill().then(setStatus)
            }
          }}>{status.status === 'ready' ? 'Run' : 'Stop'}</button>
        </section>
      </div>
    </div>
  </ThemeProvider>
}

render(<Index />, document.body)
