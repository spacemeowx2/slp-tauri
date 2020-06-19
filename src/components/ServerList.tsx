import React, { useState, useEffect, useCallback } from 'react'
import { ServerItem, ping as pingServer } from '../tauri'

type ServerProps = {
  server: ServerItem
}

const useInterval = (cb: () => Promise<void>, interval: number, start: boolean) => {
  useEffect(() => {
    if (start) {
      let stop = false
      let id: ReturnType<typeof setTimeout>
      const tick = async () => {
        await cb()
        if (!stop) {
          id = setTimeout(tick, interval)
        }
      }
      tick()
      return () => {
        stop = true
        clearTimeout(id)
      }
    }
  }, [cb, interval, start])
}

export const Server: React.FC<ServerProps> = ({ server }) => {
  const [ open, setOpen ] = useState(false)
  const [ ping, setPing ] = useState(-1)
  useInterval(useCallback(async () => {
    const addr = `${server.ip}:${server.port}`
    setPing(await pingServer(addr))
  }, [server.ip, server.port]), 5 * 1000, open)

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
