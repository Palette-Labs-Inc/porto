import { createFileRoute } from '@tanstack/react-router'

import { PortoLogo } from '../components/PortoLogo'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center">
      <div className="w-[20%]">
        <PortoLogo />
      </div>
    </div>
  )
}
