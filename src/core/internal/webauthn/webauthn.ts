import * as WebAuthnP256 from 'ox/WebAuthnP256'

export const createCredential = async (options: WebAuthnP256.createCredential.Options) => {
  return WebAuthnP256.createCredential(options)
}

export const sign = async (options: WebAuthnP256.sign.Options) => {
  return WebAuthnP256.sign(options)
}
