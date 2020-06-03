import React from 'react'

export const withStatic = <T, P = {}>(fc: React.FC<P>, statics: T) => {
  for (const key of Object.keys(statics)) {
    // @ts-ignore
    fc[key] = statics[key]
  }
  return fc as React.FC<P> & T
}
