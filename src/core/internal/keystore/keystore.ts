import type { KeystoreHost, KeystoreResolver } from './types.js'

export const keystoreResolver: KeystoreResolver = {
  resolveKeystoreHost: (keystoreHost: KeystoreHost): KeystoreHost => {
    if (keystoreHost === 'self') return undefined
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    )
      return undefined

    const resolvedHost = keystoreHost
    return resolvedHost
  },
}
