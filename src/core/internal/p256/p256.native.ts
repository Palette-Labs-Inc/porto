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
      privateKey: result.privateKey,
    }
  },

  async sign(options) {
    if (options.keyData.platform !== 'native') {
      throw new Error(
        'Invalid key type for native platform, the package is not properly resolving native vs. web file paths.',
      )
    }

    console.info('[P256-PORTO.sign]:options', options)

    const signOptions = {
      privateKeyStorageKey: options.privateKey,
      payload: options.payload,
      requireAuthentication: false,
      keychainService: ExpoP256.KEY_PREFIX,
    }

    return ExpoP256.sign(signOptions)
  },
}