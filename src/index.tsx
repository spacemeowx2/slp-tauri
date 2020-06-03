import React from 'react'
import { render } from 'react-dom'
import './css'
import { Tabs } from './components/Tabs'

const Index: React.FC = () => {
  const [ count, setCount ] = React.useState(0)

  return <>
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
            <div className='field-row' style={{ justifyContent: 'center' }}>
              <button onClick={() => setCount(count + 1)}>+</button>
              <button onClick={() => setCount(count - 1)}>-</button>
              <button onClick={() => setCount(0)}>0</button>
            </div>
          </Tabs.Item>
          <Tabs.Item id='Proxy'>
          <p>You can set proxy here</p>
          </Tabs.Item>
        </Tabs>
      </div>
    </div>
  </>
}

render(<Index />, document.body)
