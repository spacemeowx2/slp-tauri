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

export const myCustomCommand = (argument: string): Promise<void> => {
  return window.tauri.promisified({
    cmd: 'myCustomCommand',
    argument,
  })
}
