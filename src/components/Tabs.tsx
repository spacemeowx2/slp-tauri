import React, { useState } from 'react'
import { withStatic } from '../utils/withStatic'

type TabsItemProps = {
  id: string
  title?: React.ReactNode
}

export const TabsItem: React.FC<TabsItemProps> = ({ children }) => <>
  <article role='tabpanel'>
    {children}
  </article>
</>

type TabsProps = {
  children?: React.ReactElement<TabsItemProps>[] | React.ReactElement<TabsItemProps> | false
}

export const Tabs = withStatic((({ children }) => {
  const c = React.Children.toArray(children) as React.ReactElement<TabsItemProps>[]
  const [ id, setId ] = useState(c[0].props.id)

  return <>
    <menu role='tablist'>
      { c.map(({ props }) => <button
        role='tab'
        key={props.id}
        aria-selected={props.id === id}
        onClick={() => setId(props.id)}
      >{props.title || props.id}</button>)}
    </menu>
    { c.filter(i => i.props.id === id) }
  </>
}) as React.FC<TabsProps>, {
  Item: TabsItem
})
