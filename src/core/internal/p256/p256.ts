import * as WebCryptoP256 from 'ox/WebCryptoP256'
import type { IP256, P256KeyPair } from './types.js'

export const P256: IP256 = {
  async createKeyPair(
    options?: WebCryptoP256.createKeyPair.Options,
  ): Promise<P256KeyPair> {
    return WebCryptoP256.createKeyPair(options)
  },

  async sign(options) {
    if (!options.privateKey) {
      throw new Error(
        'Invalid key type for web platform, the package is not properly resolving native vs. web file paths.',
      )
    }

    return WebCryptoP256.sign({
      payload: options.payload,
      privateKey: options.privateKey,
    })
  },
}
