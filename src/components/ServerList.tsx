import React, { useState, useEffect } from 'react'
import { ServerItem, ping as pingServer } from '../tauri'

type ServerProps = {
  server: ServerItem
}

export const Server: React.FC<ServerProps> = ({ server }) => {
  const [ open, setOpen ] = useState(false)
  const [ ping, setPing ] = useState(-1)
  useEffect(() => {
    if (open) {
      let stop = false
      let id: ReturnType<typeof setTimeout>
      const tick = async () => {
        const addr = `${server.ip}:${server.port}`
        setPing(await pingServer(addr))
        if (!stop) {
          id = setTimeout(tick, 5 * 1000)
        }
      }
      tick()
      return () => {
        stop = true
        clearTimeout(id)
      }
    }
  }, [ open, server.ip, server.port ])

  return <>
    <li>
      <details open={open}>
        <summary onClick={(e) => {
          setOpen(i => !i)
          e.stopPropagation()
          e.preventDefault()
        }}>{server.name} ({server.ip}:{server.port})</summary>
        { open && <ul>
          <li>Ping: {ping}</li>
        </ul> }
      </details>
    </li>
  </>
}

type ServerListProps = {
  serverList: ServerItem[]
  value: string
  onChange: (value: string) => void
}

const key = (i: ServerItem) => `${i.ip}:${i.port}`

export const ServerList: React.FC<ServerListProps> = ({ serverList }) => {
  return <>
    <ul className='tree-view'>
      { serverList.map((i) => <Server server={i} key={key(i)} />)}
    </ul>
  </>
}
