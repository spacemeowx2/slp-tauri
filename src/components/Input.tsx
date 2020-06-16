import React from 'react'

type InputProps = {
  value: string
  onChange: (v: string) => void
  placeholder?: string
}

export const Input: React.FC<InputProps> = ({ value, onChange, placeholder }) => {
  return <>
    <input type='text' value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
  </>
}
