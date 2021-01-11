import { withType } from './components/Config'
import { ServerItem } from './tauri'

export interface Options {
  debug: boolean
  language: string
  serverSource: string
  // 127.0.0.1:1080
  proxy: string
  server: string
  localServer: ServerItem[]
  remoteServer: ServerItem[]
}

export const { useConfigInput } = withType<Options>()

export const ServerListSource = [
  'https://switch-lan-play.github.io/server-list/server-list.json',
  'http://lan-play.com/data/servers.json'
]
