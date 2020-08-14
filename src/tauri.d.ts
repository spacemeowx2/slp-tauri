declare module 'tauri/api/fs' {
  export const enum Dir {
    Audio = 1,
    Cache = 2,
    Config = 3,
    Data = 4,
    LocalData = 5,
    Desktop = 6,
    Document = 7,
    Download = 8,
    Executable = 9,
    Font = 10,
    Home = 11,
    Picture = 12,
    Public = 13,
    Runtime = 14,
    Template = 15,
    Video = 16,
    Resource = 17,
    App = 18
  }
  export interface Options {
    dir: Dir
  }
  export function readTextFile (filePath: string, options?: Options): Promise<string>;
  export function writeFile (file: { path: string, contents: string }, options?: Options): Promise<void>;
  export function createDir (dir: string, options?: Options): Promise<void>;
}
