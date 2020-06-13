import React, { useState } from 'react'
import { render } from 'react-dom'
import { ThemeProvider, Theme } from './css'
import { Tabs } from './components/Tabs'
import { useInput } from './hooks'
import { Select } from './components/Select'
import { myCustomCommand } from './tauri'

const Index: React.FC = () => {
  const [ count, setCount ] = useState(0)
  const [ msg, setMsg ] = useState('msg')
  const [ theme, themeProps ] = useInput<string>('xp')

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
          <Tabs.Item id='Proxy'>
            <p>You can set proxy here</p>
          </Tabs.Item>
          <Tabs.Item id='Settings'>
            <label>Select a theme</label>
            <Select options={['98', 'xp']} {...themeProps}/>
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  </ThemeProvider>
}

render(<Index />, document.body)
