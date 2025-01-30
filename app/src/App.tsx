import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client'
import { RouterProvider } from '@tanstack/react-router'
import { WagmiProvider } from 'wagmi'

import { persister, queryClient } from './lib/query.ts'
import { router } from './lib/router.ts'
import { config } from './lib/wagmi.ts'

export function App() {
  return (
    <WagmiProvider config={config}>
      <PersistQueryClientProvider
        client={queryClient}
        persistOptions={{ persister }}
      >
        <RouterProvider router={router} />
      </PersistQueryClientProvider>
    </WagmiProvider>
  )
}
