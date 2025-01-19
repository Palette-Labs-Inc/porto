import type { KeystoreHost, KeystoreResolver } from './types.js'

export const keystoreResolver: KeystoreResolver = {
  resolveKeystoreHost: (keystoreHost: KeystoreHost): KeystoreHost => {
    if (keystoreHost === 'self') return undefined
    return keystoreHost
  },
}
