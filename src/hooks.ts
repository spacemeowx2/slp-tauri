import { useState } from 'react'

export const useInput = <T>(initialValue: T) => {
  const [ value, setValue ] = useState(initialValue)
  return [ value, {
    value,
    onChange: (_: any, v: T) => setValue(v)
  }] as const
}

export const useInputWithRule = (initialValue: string, rule: RegExp, err: string) => {
  const [ value, setValue ] = useState(initialValue)
  return [ value, {
    value,
    onChange: (_: any, v: string) => setValue(v),
    errorMessage: (value.length === 0 || rule.test(value)) ? undefined : err
  }] as const
}
