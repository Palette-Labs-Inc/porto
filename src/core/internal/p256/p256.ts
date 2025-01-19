import * as WebCryptoP256 from 'ox/WebCryptoP256'
import type { IP256 } from './types.js'

export const P256: IP256 = {
  createCredential: WebCryptoP256.createKeyPair,
  sign: WebCryptoP256.sign,
}