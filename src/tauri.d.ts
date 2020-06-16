declare module 'tauri/api/http' {
  export const enum BodyType {
      Form = 1,
      File = 2,
      Auto = 3,
  }
  type HttpOptions = {
    options: {
      method: string
      url: string
      headers?: object
      properties?: object
      body?: string | object | ArrayBuffer
    }
    followRedirects: boolean // whether to follow redirects or not
    maxRedirections: number // max number of redirections
    connectTimeout: number // request connect timeout
    readTimeout: number // request read timeout
    timeout: number // request timeout
    allowCompression: boolean
    responseType?: ResponseType
    bodyType?: BodyType
  }
  export const get: (url: string, options?: Partial<HttpOptions>) => Promise<any>;
}
