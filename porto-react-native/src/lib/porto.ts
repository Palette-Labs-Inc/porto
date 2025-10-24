import * as WebAuthN from '@porto/expo-webauthn'
import { Hex, Value } from 'ox'
import { Mode, Porto } from 'porto'
import { baseSepolia } from 'porto/core/Chains'
import { http } from 'viem'
import * as Storage from '#lib/storage'

import { exp1Address, exp2Address } from '#lib/_generated/contracts.ts'

/**
 * Toggle between local and production relay using environment variable.
 * 
 * Configuration is managed via .env file:
 *   1. Copy .env.example to .env
 *   2. Set LOCAL_RELAY=true for local development
 *   3. Set LOCAL_RELAY=false for production
 * 
 * Convenience scripts:
 *   pnpm relay:start  (starts local relay)
 *   pnpm start        (starts app, reads LOCAL_RELAY from .env)
 *   pnpm relay:stop   (stops local relay)
 */
const USE_LOCAL_RELAY = process.env.LOCAL_RELAY === 'true'

const RELAY_URL = USE_LOCAL_RELAY
  ? process.env.LOCAL_RELAY_URL || 'http://localhost:9200'
  : process.env.PRODUCTION_RELAY_URL || 'https://rpc.porto.sh'

// Log which relay is being used (dev only)
if (__DEV__) {
  console.info(`🔗 Porto Relay: ${USE_LOCAL_RELAY ? 'LOCAL' : 'PRODUCTION'} (${RELAY_URL})`)
}

export const porto = Porto.create({
  mode: Mode.relay({
    webAuthn: {
      createFn: (options) => WebAuthN.createCredential(options),
      getFn: (options) => WebAuthN.getCredential(options),
    },
    // Set RP ID to your associated domain host (no protocol)
    keystoreHost: 'mperhats.github.io',
  }),
  chains: [baseSepolia],
  // Platform-specific storage: MMKV (native) or localStorage (web)
  storage: Storage.storage,
  // Configure relay transport
  transports: {
    [baseSepolia.id]: {
      default: http(),
      relay: http(RELAY_URL),
    } as any,
  },
})

const chainId = baseSepolia.id

/**
 * Permissions configuration for session keys.
 */
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
      symbol: 'EXP2', // Changed to match exp2Token
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
          token: exp2Token,
        },
      ],
    },
  } as const
}
