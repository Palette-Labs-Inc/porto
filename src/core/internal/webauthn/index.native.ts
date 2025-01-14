import * as ExpoWebAuthN from '@porto/expo-webauthn'
import * as WebAuthnP256 from 'ox/WebAuthnP256'
import type { WebAuthnInterface } from './types.js'

export const WebAuthN: WebAuthnInterface = {
  createCredential: (options) => WebAuthnP256.createCredential({
    ...options,
    createFn: ExpoWebAuthN.createCredential
  }),
  sign: (options) => WebAuthnP256.sign({
    ...options,
    getFn: ExpoWebAuthN.getCredential
  })
}