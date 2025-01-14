import type { KeystoreHost, KeystoreResolver } from './index'
import * as WebAuthn from '../webauthn.js'

export const keystoreResolver: KeystoreResolver = {
  resolveKeystoreHost: (keystoreHost: KeystoreHost): KeystoreHost => {
    if (keystoreHost === 'self') return undefined
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    )
      return undefined
    
    const resolvedHost = keystoreHost
    if (resolvedHost) WebAuthn.touchWellknown({ rpId: resolvedHost })
    return resolvedHost
  }
} 