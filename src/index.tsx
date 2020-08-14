import './global.css'
import React, { useState, useMemo, useEffect, useRef, Fragment } from 'react'
import { render } from 'react-dom'
import { run, kill, Status, getStatus, pollOutput } from './tauri'
import { ConfigProvider } from './components/Config'
import { Pivot, PivotItem, ComboBox, TextField, initializeIcons, PrimaryButton } from '@fluentui/react'
import { Proxy } from './pages/Proxy'
import { Server } from './pages/Server'
import { useConfigInput, ServerListSource } from './cfg'

initializeIcons()

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


const Index: React.FC = () => {
  const [ err, setErr ] = useState('')
  const [ , serverSourceProps ] = useConfigInput('serverSource', ServerListSource[0])
  const [ proxy, proxyProps ] = useConfigInput('proxy', '')
  const [ server ] = useConfigInput('server', '')
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

  return <div className='window'>
    <div className='window-body'>
      <Pivot>
        <PivotItem headerText='Server'>
          <Server />
        </PivotItem>
        <PivotItem headerText='Proxy'>
          <Proxy />
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
