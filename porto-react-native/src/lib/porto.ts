import * as WebAuthN from '@porto/expo-webauthn'
import type { Chain } from 'porto/core/Chains'
import { Hex, Value } from 'ox'
import { Mode, Porto } from 'porto'
import { baseSepolia } from 'porto/core/Chains'
import { http, relayProxy } from 'porto/core/Transport'
import { foundry } from 'viem/chains'
import * as Storage from '#lib/storage'

import { delegationAddress, exp1Address, exp2Address } from '#lib/_generated/contracts.ts'

/**
 * Toggle between local and production relay using environment variable.
 *
 * Configuration is managed via .env file:
 *   1. Copy .env.example to .env
 *   2. Set EXPO_PUBLIC_LOCAL_RELAY=true for local development
 *   3. Set EXPO_PUBLIC_LOCAL_RELAY=false for production
 *
 * Note: Environment variables must be prefixed with EXPO_PUBLIC_ to be
 * available in the app. Metro watches .env changes during development.
 *
 * Known Issue: As of v26.0.2, the local Porto Relay has a bug where gas wallet
 * registration fails during initialization. Until this is fixed, use production relay:
 *   EXPO_PUBLIC_LOCAL_RELAY=false
 *
 * Convenience scripts:
 *   pnpm relay:start  (starts local relay)
 *   pnpm start        (starts app, reads from .env)
 *   pnpm relay:stop   (stops local relay)
 */
const USE_LOCAL_RELAY = process.env.EXPO_PUBLIC_LOCAL_RELAY === 'true'

// Note: Mode.relay() requires the full Porto Relay server (port 9119), not just the proxy (port 9200)
// The relay server implements wallet_* methods needed by Mode.relay()
const RELAY_URL = USE_LOCAL_RELAY
  ? process.env.EXPO_PUBLIC_LOCAL_RELAY_URL || 'http://localhost:9119'
  : process.env.EXPO_PUBLIC_PRODUCTION_RELAY_URL || 'https://rpc.porto.sh'

// For local development, we also need the public RPC endpoint (Anvil through proxy)
const PUBLIC_RPC_URL = USE_LOCAL_RELAY
  ? 'http://localhost:9200'
  : 'https://sepolia.base.org'

// Define local Anvil chain for local relay (chain ID 31337)
// The delegation address is synced from the local relay via `pnpm relay:sync`
const ANVIL_CHAIN_ID = 31337 as const
const anvilDelegationAddress = delegationAddress[ANVIL_CHAIN_ID]

const anvilLocal: Chain = {
  ...foundry,
  contracts: {
    ...foundry.contracts,
    delegation: {
      // This address is deployed by the local relay and synced to the generated contracts file
      // Run `pnpm relay:sync` after starting the relay to update this address
      address: anvilDelegationAddress,
    },
  },
  rpcUrls: {
    default: { http: [RELAY_URL] },
  },
}

// Use local chain (31337) or production chain (84532) based on relay mode
const currentChain = USE_LOCAL_RELAY ? anvilLocal : baseSepolia

// Log which relay is being used (dev only)
if (__DEV__) {
  console.info(
    `🔗 Porto Relay: ${USE_LOCAL_RELAY ? 'LOCAL' : 'PRODUCTION'} (${RELAY_URL})`,
  )
  console.info(`⛓️  Chain: ${currentChain.name} (ID: ${currentChain.id})`)
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
  chains: [currentChain],
  // Platform-specific storage: MMKV (native) or localStorage (web)
  storage: Storage.storage,
  // Configure relay transport: routes wallet/account methods to relay, everything else to public RPC
  transports: {
    [currentChain.id]: relayProxy({
      // relay: Porto Relay server (port 9119 local, rpc.porto.sh production)
      // public: Public RPC for chain reads (port 9200 local proxy to Anvil, sepolia.base.org production)
      relay: http(RELAY_URL),
      public: http(PUBLIC_RPC_URL),
    }),
  },
})

/**
 * Permissions configuration for session keys.
 * Dynamically uses the correct chain based on relay mode.
 */
export const permissions = () => {
  const chainId = currentChain.id
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
