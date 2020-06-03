import React, { useMemo } from 'react'

type Item = { text: string, value: string }
type SelectProps = {
  options: (string | Item)[]
  value: string
  onChange: (v: string) => void
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange }) => {
  const o = useMemo(() => {
    return options.map((i: Item | string) =>
      typeof i === 'string' ?
        {
          value: i,
          text: i,
        } : i
      )
  }, [ options ])
  return <>
    <select onChange={(e) => onChange(e.target.value)}>
      { o.map(i => <option
        key={i.value}
        selected={value === i.value}
        value={i.value}
      >{i.text}</option>)}
    </select>
  </>
}
