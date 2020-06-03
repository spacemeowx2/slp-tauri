declare global {
  interface Window {
    tauri: {
      invoke(args: {
        cmd: string
        [key: string]: any
      }): void
    }
  }
}

export const myCustomCommand = (argument: string) => {
  window.tauri.invoke({
    cmd: 'myCustomCommand',
    argument,
  })
}
