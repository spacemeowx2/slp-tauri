import React from 'react'

type InputProps = {
  value: string
  onChange: (v: string) => void
}

export const Input: React.FC<InputProps> = ({ value, onChange }) => {
  return <>
    <input type='text' value={value} onChange={(e) => onChange(e.target.value)} />
  </>
}
