import type * as PublicKey  from 'ox/PublicKey'
import type * as Signature from 'ox/Signature'
import type { Hex, Bytes } from 'ox'
import type { P256KeyData } from '../accountDelegation.js'

export interface IP256 {
  createKeyPair(): Promise<{
    publicKey: PublicKey.PublicKey
    keyData: P256KeyData
  }>
  
  sign(options: {
    payload: Hex.Hex | Bytes.Bytes
    keyData: P256KeyData
  }): Promise<Signature.Signature<false>>
}