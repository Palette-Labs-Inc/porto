import type { KeystoreHost, KeystoreResolver } from './index'

export const keystoreResolver: KeystoreResolver = {
  resolveKeystoreHost: (keystoreHost: KeystoreHost): KeystoreHost => {
    if (keystoreHost === 'self') return undefined
    return keystoreHost
  }
} 