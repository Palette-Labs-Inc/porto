import type * as React from 'react'

import { cx } from 'cva'
import { Header as Header_ } from './Header'
import { IndeterminateLoader } from './IndeterminateLoader'

export function Layout(props: Layout.Props) {
  const { children, loading, loadingTitle } = props

  if (loading)
    return (
      <div className="flex flex-grow p-3">
        <IndeterminateLoader title={loadingTitle} />
      </div>
    )
  return (
    <div className="flex flex-grow flex-col space-y-3 py-3">{children}</div>
  )
}

export namespace Layout {
  export type Props = {
    children: React.ReactNode
  } & (
    | {
        loading?: boolean
        loadingTitle: string
      }
    | {
        loading?: undefined
        loadingTitle?: undefined
      }
  )

  export function Header(props: Header_.Props & { className?: string }) {
    return (
      <div className={cx('flex flex-col px-3', props.className)}>
        <Header_ {...props} />
      </div>
    )
  }

  export function Content(props: {
    children: React.ReactNode
    className?: string
  }) {
    return (
      <div className={cx('flex-grow px-3', props.className)}>
        {props.children}
      </div>
    )
  }

  export function Footer(props: {
    children: React.ReactNode
    className?: string
  }) {
    return <div className={props.className}>{props.children}</div>
  }
}
