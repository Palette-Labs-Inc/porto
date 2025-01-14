import * as WebAuthnP256 from 'ox/WebAuthnP256'
import type { WebAuthnInterface } from './types.js'

export const WebAuthN: WebAuthnInterface = {
  createCredential: WebAuthnP256.createCredential,
  sign: WebAuthnP256.sign
} 