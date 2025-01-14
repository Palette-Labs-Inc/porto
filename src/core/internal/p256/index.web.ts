import * as WebCryptoP256 from 'ox/WebCryptoP256'
import type { IP256 } from './types.js'

export const P256: IP256 = {
  async createKeyPair() {
    const keyPair = await WebCryptoP256.createKeyPair()
    return {
      publicKey: keyPair.publicKey,
      keyData: {
        platform: 'web',
        privateKey: keyPair.privateKey
      }
    }
  },

  async sign(options) {
    if (options.keyData.platform !== 'web') {
        throw new Error('Invalid key type for web platform, the package is not properly resolving native vs. web file paths.')
    }
    
    return WebCryptoP256.sign({
      payload: options.payload,
      privateKey: options.keyData.privateKey
    })
  }
}