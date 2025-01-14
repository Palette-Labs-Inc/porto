export type KeystoreHost = 'self' | (string & {}) | undefined

export interface KeystoreResolver {
  resolveKeystoreHost: (keystoreHost: KeystoreHost) => KeystoreHost
}

export { keystoreResolver } from './index.web.js' 