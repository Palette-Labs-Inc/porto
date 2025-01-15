import * as ExpoP256 from '@porto/expo-p256'
import type { IP256 } from './types.js'

export const P256: IP256 = {
  async createKeyPair() {
    const result = await ExpoP256.createKeyPair({
      requireAuthentication: false, // otherwise key requires user authentication, not really a delegated signer.
      keychainService: ExpoP256.KEY_PREFIX,
    })

    return {
      publicKey: result.publicKey,
      keyData: {
        platform: 'native',
        privateKeyStorageKey: result.privateKeyStorageKey,
      },
    }
  },

  async sign(options) {
    if (options.keyData.platform !== 'native') {
      throw new Error(
        'Invalid key type for native platform, the package is not properly resolving native vs. web file paths.',
      )
    }

    return ExpoP256.sign({
      privateKeyStorageKey: options.keyData.privateKeyStorageKey,
      payload: options.payload,
      requireAuthentication: false,
      keychainService:  ExpoP256.KEY_PREFIX,
    })
  },
}
