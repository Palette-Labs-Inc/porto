import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { RpcSchema } from 'ox'
import type { RpcSchema as porto_RpcSchema } from 'porto'
import { Actions, Hooks } from 'porto/remote'

import { porto } from '../../lib/porto'
import { SignIn } from './-components/SignIn'
import { SignUp } from './-components/SignUp'

export const Route = createFileRoute('/_dialog/dialog/eth_requestAccounts')({
  component: RouteComponent,
  validateSearch: (
    search,
  ): RpcSchema.ExtractParams<porto_RpcSchema.Schema, 'eth_requestAccounts'> =>
    search as never,
})

function RouteComponent() {
  const address = Hooks.usePortoStore(
    porto,
    (state) => state.accounts[0]?.address,
  )

  const queued = Hooks.useRequest(porto)
  const respond = useMutation({
    mutationFn() {
      if (!queued) throw new Error('no request queued.')
      return Actions.respond(porto, queued)
    },
  })

  if (address)
    return (
      <SignIn
        loading={respond.isPending}
        onApprove={() => respond.mutate()}
        onReject={() => Actions.reject(porto, queued!)}
      />
    )
  return (
    <SignUp
      enableSignIn={true}
      loading={respond.isPending}
      onApprove={() => respond.mutate()}
      onReject={() => Actions.reject(porto, queued!)}
    />
  )
}
