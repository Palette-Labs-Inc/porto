import { http, createConfig } from 'wagmi'
import { odysseyTestnet } from 'wagmi/chains'

export const config = createConfig({
  chains: [odysseyTestnet],
  transports: {
    [odysseyTestnet.id]: http(),
  },
})

declare module 'wagmi' {
  interface Register {
    config: typeof config
  }
}
