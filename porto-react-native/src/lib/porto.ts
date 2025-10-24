import * as WebAuthN from '@porto/expo-webauthn'
import { Hex, Value } from 'ox'
import { Mode, Porto } from 'porto'
import { baseSepolia } from 'porto/core/Chains'

import { exp1Address, exp2Address } from '#lib/_generated/contracts.ts'

export const porto = Porto.create({
  mode: Mode.relay({
    // Use device-native WebAuthN via our Expo module
    webAuthn: {
      createFn: (options) => WebAuthN.createCredential(options),
      getFn: (options) => WebAuthN.getCredential(options),
    },
    // Set RP ID to your associated domain host (no protocol)
    keystoreHost: process.env.EXPO_PUBLIC_SERVER_DOMAIN,
  }),
  chains: [baseSepolia],
})

const chainId = baseSepolia.id

export const permissions = () => {
  const exp1Token = exp1Address[chainId as keyof typeof exp1Address]
  if (!exp1Token) {
    console.warn(`exp1 address not defined for chainId ${chainId}`)
    return undefined
  }
  const exp2Token = exp2Address[chainId as keyof typeof exp2Address]
  if (!exp2Token) {
    console.warn(`exp2 address not defined for chainId ${chainId}`)
    return undefined
  }
  return {
    expiry: Math.floor(Date.now() / 1_000) + 60 * 60, // 1 hour
    feeToken: {
      limit: '1',
      symbol: 'EXP',
    },
    permissions: {
      calls: [
        {
          to: exp1Token,
        },
        {
          to: exp2Token,
        },
        {
          signature: 'mint()',
          to: '0xdeadbeefdeadbeefdeadbeefdeadbeefdeadbeef',
        },
      ],
      spend: [
        {
          limit: Hex.fromNumber(Value.fromEther('50')),
          period: 'minute',
          token: exp1Token,
        },
      ],
    },
  } as const
}
