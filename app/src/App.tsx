import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { RouterProvider } from '@tanstack/react-router'
import { Hooks } from 'porto/remote'
import { WagmiProvider } from 'wagmi'

import { useAppStore } from './lib/app.ts'
import { porto } from './lib/porto.ts'
import { persister, queryClient } from './lib/query.ts'
import { router } from './lib/router.ts'
import { config } from './lib/wagmi.ts'

export function App() {
  const appState = useAppStore()
  const portoState = Hooks.usePortoStore(porto)
  return (
    <WagmiProvider config={config}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <RouterProvider router={router} context={{ appState, portoState }} />
      </PersistQueryClientProvider>
    </WagmiProvider>
  )
}
