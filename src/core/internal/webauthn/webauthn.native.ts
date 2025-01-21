import * as ExpoWebAuthN from '@porto/expo-webauthn'
import * as WebAuthnP256 from 'ox/WebAuthnP256'

export const createCredential = async ( options: WebAuthnP256.createCredential.Options) => {
  return WebAuthnP256.createCredential({
    ...options,
    createFn: ExpoWebAuthN.createCredential,
  })
}

export const sign = async (options: WebAuthnP256.sign.Options) => {
  return WebAuthnP256.sign({
    ...options,
    getFn: ExpoWebAuthN.getCredential,
  })
}
