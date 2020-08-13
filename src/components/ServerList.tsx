import React from 'react'
import { ServerItem } from '../tauri'
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
}


export const Server: React.FC<ServerProps> = ({ server }) => {
  // const [ open, setOpen ] = useState(false)
  // const [ ping, setPing ] = useState(-1)
  // useInterval(useCallback(async () => {
  //   const addr = `${server.ip}:${server.port}`
  //   setPing(await pingServer(addr))
  // }, [server.ip, server.port]), 5 * 1000, open)

  return <>
    <div className={classNames.itemCell} data-is-focusable={true}>
      <div className={classNames.itemContent}>
        <div className={classNames.itemName}>{server.ip}</div>
        <div className={classNames.itemIndex}>{`Port ${server.port}`}</div>
        <div>{server.name}</div>
      </div>
      <Icon className={classNames.chevron} iconName={'ChevronRight'} />
    </div>
    {/* <li>
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
    </li> */}
  </>
}

type ServerListProps = {
  serverList: ServerItem[]
  value: string
  onChange: (value: string) => void
}


export const ServerList: React.FC<ServerListProps> = ({ serverList }) => {
  return <>
    <List items={serverList} onRenderCell={(item) => {
      return <Server server={item} />
    }} />
  </>
}
