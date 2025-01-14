import type * as WebAuthnP256 from 'ox/WebAuthnP256'

export interface WebAuthnInterface {
  createCredential(
    options: WebAuthnP256.createCredential.Options,
  ): Promise<WebAuthnP256.P256Credential>

  sign(
    options: WebAuthnP256.sign.Options,
  ): Promise<WebAuthnP256.sign.ReturnType>
}
