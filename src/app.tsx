import './global.css'
import React, { useState, useMemo, useEffect, useRef, Fragment } from 'react'
import { render } from 'react-dom'
import { run, kill, Status, getStatus, pollOutput } from './tauri'
import { ConfigProvider } from './components/Config'
import { Pivot, PivotItem, initializeIcons, PrimaryButton, Label } from '@fluentui/react'
import { Server } from './pages/Server'
import { useConfigInput } from './cfg'
import { LangProvider, useLang } from './lang'
import { Settings } from './pages/Settings'

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
  const [ proxy ] = useConfigInput('proxy', '')
  const [ server ] = useConfigInput('server', '')
  const [ debug, { onChange: setDebug } ] = useConfigInput('debug', false)
  const [ status, setStatus ] = useState<Status>({ status: 'ready' })
  const [ output, setOutput ] = useState<string[]>([])
  const { t } = useLang()
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
        <PivotItem headerText={t('server')}>
          <Server />
        </PivotItem>
        <PivotItem headerText={t('settings')}>
          <Settings />
        </PivotItem>
        { status.status === 'running' && <PivotItem headerText={t('output')}>
          <Log log={output}/>
        </PivotItem> }
      </Pivot>
    </div>
    <section className='bottom' onDoubleClick={() => setDebug(!debug)}>
      { err && <p>{String(err)}</p> }
      { debug && <Label disabled style={{margin: 5}}>lan-play {commandLine.join(' ')}</Label> }
      <PrimaryButton onClick={() => {
        if (status.status === 'ready') {
          run(commandLine).then(setStatus).then(() => setOutput([]), setErr)
        } else {
          kill().then(setStatus, setErr)
        }
      }}>{status.status === 'ready' ? t('run') : t('stop')}</PrimaryButton>
    </section>
  </div>
}

render(<>
  <ConfigProvider>
    <LangProvider>
        <Index />
    </LangProvider>
  </ConfigProvider>
</>, document.getElementById('app'))
