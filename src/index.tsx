import React from 'react'
import { render } from 'react-dom'

const Index: React.FC = () => {
  return <>
    <p>Hello world</p>
  </>
}

render(<Index />, document.getElementById('app'))
