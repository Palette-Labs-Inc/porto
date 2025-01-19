import * as WebAuthnP256 from 'ox/WebAuthnP256'
import type { IWebAuthn } from './types'

export const WebAuthN: IWebAuthn = {
  createCredential: WebAuthnP256.createCredential,
  sign: WebAuthnP256.sign,
}
