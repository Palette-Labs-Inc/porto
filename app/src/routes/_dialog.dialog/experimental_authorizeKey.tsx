import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { RpcSchema } from 'ox'
import type { RpcSchema as porto_RpcSchema } from 'porto'
import { Actions, Hooks } from 'porto/remote'

import { porto } from '../../lib/porto'
import { Authorize } from './-components/Authorize'

export const Route = createFileRoute(
  '/_dialog/dialog/experimental_authorizeKey',
)({
  component: RouteComponent,
  validateSearch(
    search,
  ): RpcSchema.ExtractParams<
    porto_RpcSchema.Schema,
    'experimental_authorizeKey'
  > {
    return search as never
  },
})

function RouteComponent() {
  const { 0: parameters } = Route.useSearch() ?? {}

  const request = Hooks.useRequest(porto)
  const respond = useMutation({
    mutationFn() {
      return Actions.respond(porto, request!)
    },
  })

  return (
    <Authorize
      {...parameters}
      address={undefined}
      key={parameters?.key as never}
      loading={respond.isPending}
      onApprove={() => respond.mutate()}
      onReject={() => Actions.reject(porto, request!)}
    />
  )
}
