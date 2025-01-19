import type { Provider } from '../provider.js'
import type { Announcer } from './types.js'

/**
 * Skip provider announcement in React Native.
 * EIP-6963 solves browser extension provider conflicts where multiple wallets
 * compete to inject into window.ethereum. This isn't relevant for React Native
 * since mobile apps:
 * 1. Have their own sandboxed environment
 * 2. Don't share a global window object
 * 3. Use different patterns for wallet connections
 */
export const announcer: Announcer = {
  announce: (_provider: Provider) => {
    // No-op for native platforms
    return () => {}
  },
}
