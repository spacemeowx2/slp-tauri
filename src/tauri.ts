/// <reference path='./tauri.d.ts'/>
import { writeFile, Dir, readTextFile, createDir } from "tauri/api/fs"
import { promisified as tauriPromisified } from 'tauri/api/tauri'

const promisified = async (args: any): Promise<any> => {
  return JSON.parse(await tauriPromisified(args))
}

export const print = (argument: string): Promise<void> => {
  return promisified({
    cmd: 'print',
    argument,
  })
}

export interface Status {
  status: 'running' | 'ready'
}

export const run = (args: string[]): Promise<Status> => {
  return promisified({
    cmd: 'run',
    arguments: args,
  })
}

export const kill = (): Promise<Status> => {
  return promisified({
    cmd: 'kill',
  })
}

export const getStatus = (): Promise<Status> => {
  return promisified({
    cmd: 'getStatus',
  })
}

export const pollOutput = (): Promise<string> => {
  return promisified({
    cmd: 'pollOutput',
  })
}

export const writeConfig = async (cfg: any) => {
  try {
    await createDir('slp-tauri', { dir: Dir.LocalData })
  } catch (e) {
    console.log('failed to create dir, ignore', e)
  }
  await writeFile({ path: 'slp-tauri/config.json', contents: JSON.stringify(cfg, null, 2) }, {
    dir: Dir.LocalData
  })
}

export const readConfig = async () => {
  return JSON.parse(await readTextFile('slp-tauri/config.json', {
    dir: Dir.LocalData
  }))
}

export interface ServerItem {
  name?: string
  ip: string
  port: number
}
export interface ServerListResponse {
  version: string
  serverList: ServerItem[]
}
export const get = async (url: string): Promise<string> => {
  return await promisified({
    cmd: 'get',
    url,
  })
}
export const getServerList = async (url: string): Promise<ServerListResponse> => {
  const s: string = await get(url)
  print(s)
  const data = JSON.parse(s)
  // compatibility with lan-play.com
  if (Array.isArray(data)) {
    return {
      version: '1',
      serverList: data,
    }
  }
  return data
}
export const ping = async (server: string): Promise<number> => {
  return JSON.parse(await promisified({
    cmd: 'ping',
    server,
  }))
}

export interface Config {
  server: string
  proxy: string
  serverList: string
}
export const saveConfig = () => {
  return promisified({
    cmd: 'saveConfig',
  })
}


declare global {
  interface Window {
    tauri: {
      /**
       * @name invoke
       * @description Calls a Tauri Core feature, such as setTitle
       * @param {Object} args
       */
      invoke(args: {
        cmd: string
        [key: string]: any
      }): void

      /**
       * @name transformCallback
       * @description Registers a callback with a uid
       * @param {Function} callback
       * @param {Boolean} once
       * @returns {*}
       */
      transformCallback(callback: Function, once?: boolean): Function

      /**
       * @name promisified
       * @description Turns a request into a chainable promise
       * @param {Object} args
       * @returns {Promise<any>}
       */
      promisified<T>(args: object): Promise<T>
    }
  }
}
