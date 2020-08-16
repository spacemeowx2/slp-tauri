import React, { useMemo, useState, useEffect } from 'react'
import { ServerItem, ping as pingServer } from '../tauri'
import { List, mergeStyleSets, getFocusStyle, getTheme, Icon } from '@fluentui/react'

const theme = getTheme()
const { palette, semanticColors, fonts } = theme
const classNames = mergeStyleSets({
  itemCell: [
    getFocusStyle(theme, { inset: -1 }),
    {
      minHeight: 54,
      padding: 10,
      boxSizing: 'border-box',
      borderBottom: `1px solid ${semanticColors.bodyDivider}`,
      display: 'flex',
      selectors: {
        '&:hover': { background: palette.neutralLight },
      },
      cursor: 'pointer',
    },
  ],
  itemImage: {
    flexShrink: 0,
  },
  itemContent: {
    marginLeft: 10,
    overflow: 'hidden',
    flexGrow: 1,
  },
  itemName: [
    fonts.xLarge,
    {
      whiteSpace: 'nowrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
    },
  ],
  itemIndex: {
    fontSize: fonts.small.fontSize,
    color: palette.neutralTertiary,
    marginBottom: 10,
  },
  chevron: {
    alignSelf: 'center',
    marginLeft: 10,
    color: palette.neutralTertiary,
    fontSize: fonts.large.fontSize,
    flexShrink: 0,
  },
});

type ServerProps = {
  server: ServerItem
  checked: boolean
  onClick: () => void
}

export const Server: React.FC<ServerProps> = ({ server, onClick, checked }) => {
  const [ ping, setPing ] = useState(-1)
  useEffect(() => {
    const cb = async () => {
      const addr = `${server.ip}:${server.port}`
      setPing(await pingServer(addr))
    }
    cb()
    const id = setInterval(cb, 5 * 1000)
    return () => clearInterval(id)
  }, [ server.ip, server.port ])

  return <>
    <div className={classNames.itemCell} data-is-focusable={true} onClick={onClick}>
      <div className={classNames.itemContent}>
        <div className={classNames.itemName}>{server.ip}</div>
        <div className={classNames.itemIndex}>{`Port ${server.port} Ping ${ping}`}</div>
        <div>{server.name}</div>
      </div>
      { checked && <Icon className={classNames.chevron} iconName={'CheckMark'} /> }
    </div>
  </>
}

type ServerListProps = {
  serverList: ServerItem[]
  value: string
  onChange: (value: string) => void
}

export const key = (i: ServerItem) => `${i.ip}:${i.port}`

export const ServerList: React.FC<ServerListProps> = ({ serverList, value, onChange }) => {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const items = useMemo(() => serverList.slice(), [ value, serverList ])
  return <>
    <List
      items={items}
      onRenderCell={(item) => {
        const k = key(item)
        return <Server
          key={k}
          checked={k === value}
          onClick={() => {
            onChange(k)
          }}
          server={item}
        />
      }}
    />
  </>
}
