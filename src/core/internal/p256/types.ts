import type * as Signature from 'ox/Signature'
import type * as WebCryptoP256 from 'ox/WebCryptoP256'

export interface IP256 {
  createCredential(
    options: WebCryptoP256.createKeyPair.Options,
  ): Promise<WebCryptoP256.createKeyPair.ReturnType>

  sign(options: WebCryptoP256.sign.Options): Promise<Signature.Signature<false>>
}
