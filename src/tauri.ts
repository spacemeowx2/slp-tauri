/// <reference path='./tauri.d.ts'/>

export * from 'tauri/api/http'

export const myCustomCommand = (argument: string): Promise<void> => {
  return window.tauri.promisified({
    cmd: 'myCustomCommand',
    argument,
  })
}

export interface Status {
  status: 'running' | 'ready'
}

export const run = (args: string[]): Promise<Status> => {
  return window.tauri.promisified({
    cmd: 'run',
    arguments: args,
  })
}

export const kill = (): Promise<Status> => {
  return window.tauri.promisified({
    cmd: 'kill',
  })
}

export const getStatus = (): Promise<Status> => {
  return window.tauri.promisified({
    cmd: 'getStatus',
  })
}

export const pollOutput = (): Promise<string> => {
  return window.tauri.promisified({
    cmd: 'pollOutput',
  })
}

export interface Config {
  server: string
  proxy: string
  serverList: string
}
export const saveConfig = () => {
  return window.tauri.promisified({
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
