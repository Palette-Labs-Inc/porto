import type * as WebCryptoP256 from 'ox/WebCryptoP256'
import type * as ExpoP256 from '@porto/expo-p256'
import type * as Signature from 'ox/Signature'
import type { OneOf } from '../types.js'

/**
 * P256 key pair return type.
 * 
 * @example
 * ```ts
 * import * as P256 from './p256.js'
 * 
 * const keyPair = await P256.createKeyPair()
 * // Returns either:
 * // { privateKey: CryptoKey, publicKey: PublicKey.PublicKey } // web
 * // or
 * // { privateKeyStorageKey: string, publicKey: PublicKey.PublicKey } // native
 * ```
 */
export type P256KeyPair = OneOf<
  | WebCryptoP256.createKeyPair.ReturnType
  | ExpoP256.createKeyPair.ReturnType
>

/**
 * P256 interface for platform-specific implementations.
 * 
 * @example
 * ```ts
 * import * as P256 from './p256.js'
 * 
 * // Create a key pair
 * const keyPair = await P256.createKeyPair()
 * 
 * // Sign with WebCrypto (Browser/Web)
 * const webSignature = await P256.sign({
 *   payload: '0xdeadbeef',
 *   privateKey: keyPair.privateKey,
 * })
 * 
 * // Sign with Native (iOS/Android)
 * // iOS: Private key is generated and stored in Secure Enclave
 * // Android: Key pair is generated and stored in Android Keystore System
 * const nativeSignature = await P256.sign({
 *   payload: '0xdeadbeef',
 *   privateKeyStorageKey: keyPair.privateKeyStorageKey,
 *   requireAuthentication: false, // If true, requires biometric auth for signing
 *   keychainService: ExpoP256.KEY_PREFIX,
 *   // iOS: Uses Keychain Services API with kSecAttrService
 *   // Android: Uses Keystore Alias
 * })
 * ```
 */
export interface IP256 {
  /**
   * Creates a P256 key pair.
   * 
   * @param options - Platform-specific options for key pair creation.
   * @returns P256 key pair.
   */
  createKeyPair(
    options?: OneOf<
      | WebCryptoP256.createKeyPair.Options
      | ExpoP256.createKeyPair.Options
    >,
  ): Promise<P256KeyPair>

  /**
   * Signs a message with a P256 key.
   * 
   * @param options - Signing options.
   * @returns Signature.
   */
  sign(
    options: OneOf<
      | WebCryptoP256.sign.Options
      | ExpoP256.sign.Options
    >,
  ): Promise<Signature.Signature<false>>
}

export declare namespace sign {
  type Options = OneOf<
    | WebCryptoP256.sign.Options
    | ExpoP256.sign.Options
  >
}