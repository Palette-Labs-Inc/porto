import { useMutation } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import type { RpcSchema } from 'ox'
import type { RpcSchema as porto_RpcSchema } from 'porto'
import { Actions, Hooks } from 'porto/remote'
import { useEffect, useState } from 'react'

import { porto } from '../../lib/porto'
import { Authorize } from './-components/Authorize'
import { SignIn } from './-components/SignIn'
import { SignUp } from './-components/SignUp'

export const Route = createFileRoute('/_dialog/dialog/wallet_connect')({
  component: RouteComponent,
  validateSearch: (
    search,
  ): RpcSchema.ExtractParams<porto_RpcSchema.Schema, 'wallet_connect'> =>
    search as never,
})

function RouteComponent() {
  const { 0: parameters } = Route.useSearch() ?? {}
  const { capabilities } = parameters ?? {}

  const address = Hooks.usePortoStore(
    porto,
    (state) => state.accounts[0]?.address,
  )

  const signIn = address && !capabilities?.createAccount
  const shouldAuthorize = capabilities?.authorizeKey

  const [step, setStep] = useState<
    'authorize' | 'signIn' | 'signUp' | undefined
  >()
  useEffect(() => {
    if (signIn) {
      if (shouldAuthorize) setStep('authorize')
      else setStep('signIn')
    } else setStep('signUp')
  }, [signIn, shouldAuthorize])

  const queued = Hooks.useRequest(porto)
  const respond = useMutation({
    mutationFn({ signIn }: { signIn?: boolean }) {
      if (!queued) throw new Error('no request queued.')
      if (queued.request.method !== 'wallet_connect')
        throw new Error('request is not a wallet_connect request.')

      const params = queued.request.params ?? []

      return Actions.respond(porto, {
        ...queued,
        request: {
          ...queued.request,
          params: [
            {
              ...params[0],
              capabilities: {
                ...params[0]?.capabilities,
                createAccount: !signIn,
              },
            },
          ],
        } as typeof queued.request,
      })
    },
  })

  if (step === 'authorize' && capabilities?.authorizeKey)
    return (
      <Authorize
        {...capabilities.authorizeKey}
        address={signIn ? address : undefined}
        key={capabilities.authorizeKey.key as never}
        loading={respond.isPending}
        onApprove={() => respond.mutate({ signIn })}
        onReject={() => Actions.reject(porto, queued!)}
      />
    )
  if (step === 'signIn')
    return (
      <SignIn
        loading={respond.isPending}
        onApprove={() => respond.mutate({ signIn: true })}
        onReject={() => Actions.reject(porto, queued!)}
      />
    )
  if (step === 'signUp' && shouldAuthorize)
    return (
      <SignUp
        enableSignIn={!capabilities?.createAccount}
        onApprove={() => setStep('authorize')}
        onReject={() => Actions.reject(porto, queued!)}
      />
    )
  return (
    <SignUp
      enableSignIn={!capabilities?.createAccount}
      loading={respond.isPending}
      onApprove={(x) => respond.mutate(x)}
      onReject={() => Actions.reject(porto, queued!)}
    />
  )
}
