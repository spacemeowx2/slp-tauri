import React from 'react'
import { render } from 'react-dom'
import './css'
import { myCustomCommand } from './tauri'

myCustomCommand('test')

const Index: React.FC = () => {
  const [ count, setCount ] = React.useState(0)

  return <>
    <div style={{ width: 300 }} className="window">
      <div className="title-bar">
        <div className="title-bar-text">Switch Lan Play</div>
      </div>

      <div className="window-body">
        <p style={{ textAlign: "center" }}>Current count: {count}</p>
        <div className="field-row" style={{ justifyContent: "center" }}>
          <button onClick={() => setCount(count + 1)}>+</button>
          <button onClick={() => setCount(count - 1)}>-</button>
          <button onClick={() => setCount(0)}>0</button>
        </div>
      </div>
    </div>
  </>
}

render(<Index />, document.getElementById('app'))
