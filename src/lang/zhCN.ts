import en from './en'

const d = {
  'display': '简体中文',
  'language': '语言',

  'ok': '确定',
  'cancel': '取消',
  'server-name': '服务器名字',
  'server-address': '服务器地址',
  'loading': '载入中...',
  'fetch': '获取',
  'server': '服务器',
  'proxy': 'Socks5 代理',
  'settings': '设置',
  'run': '运行',
  'stop': '停止',
  'output': '输出',
  'server-list': '服务器列表',
  'debug': '当前命令行参数(调试用):',

  'add': '新建',
  'add-server': '新建服务器',
  'del': '删除',
  'del-server': '删除服务器',
  'del-server-confirm': '是否确定从列表中删除服务器?',
}
export type UnusedKey = Exclude<keyof typeof en, keyof typeof d>
export default d
