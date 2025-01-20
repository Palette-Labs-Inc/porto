import * as ExpoP256 from '@porto/expo-p256'
import type { IP256, P256KeyPair } from './types.js'

export const P256: IP256 = {
  async createKeyPair(options?: ExpoP256.createKeyPair.Options): Promise<P256KeyPair> {
    return ExpoP256.createKeyPair({
      requireAuthentication: false, // otherwise key requires user authentication, not really a delegated signer.
      keychainService: ExpoP256.KEY_PREFIX,
      ...options,
    })
  },

  async sign(options) {
    if (!options.privateKeyStorageKey) {
      throw new Error(
        'Invalid key type for native platform, the package is not properly resolving native vs. web file paths.',
      )
    }

    return ExpoP256.sign({
      requireAuthentication: false,
      payload: options.payload,
      privateKeyStorageKey: options.privateKeyStorageKey,
      keychainService: ExpoP256.KEY_PREFIX,
    })
  },
}