import { useState } from 'react'

export const useInput = <T>(initialValue: T) => {
  const [ value, setValue ] = useState(initialValue)
  return [ value, {
    value,
    onChange: (v: T) => setValue(v)
  }] as const
}
