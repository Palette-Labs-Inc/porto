import { createFileRoute } from '@tanstack/react-router'
import { NotFound } from './-components/NotFound'

export const Route = createFileRoute('/_dialog/dialog/$')({
  component: RouteComponent,
})

function RouteComponent() {
  return <NotFound />
}
