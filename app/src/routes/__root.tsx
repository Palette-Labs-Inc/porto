import { Outlet, createRootRoute } from '@tanstack/react-router'
import * as React from 'react'

export const Route = createRootRoute({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <>
      <Outlet />

      <React.Suspense>
        <TanStackRouterDevtools position="bottom-right" />
      </React.Suspense>
    </>
  )
}

const TanStackRouterDevtools =
  import.meta.env.PROD || window !== window.parent || Boolean(window.opener)
    ? () => null
    : React.lazy(() =>
        import('@tanstack/router-devtools').then((res) => ({
          default: res.TanStackRouterDevtools,
        })),
      )
