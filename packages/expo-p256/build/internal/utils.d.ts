import { type Bytes, Errors, type Hex } from 'ox'
import type { createKeyPair, getKeyPair, sign } from '../P256'
/**
 * Adapts the native response from createKeyPair to the WebCryptoP256-compatible format.
 * Converts the base64 encoded public key to the ox PublicKey format.
 */
export declare function adaptCreateP256KeyPairReturnType(
  nativeResponse: createKeyPair.NativeResponse,
): createKeyPair.ReturnType
/**
 * Adapts the native response from getKeyPair to the WebCryptoP256-compatible format.
 * Returns null if no key pair exists, otherwise converts to the WebCryptoP256 format.
 */
export declare function adaptGetP256KeyPairReturnType(
  nativeResponse: getKeyPair.NativeResponse,
): getKeyPair.ReturnType
/**
 * Adapts the native signature response to the WebCryptoP256-compatible format.
 * Extracts r and s values from the ASN.1 DER encoded signature.
 */
export declare function adaptSignWithP256KeyPairReturnType(
  nativeResponse: sign.NativeResponse,
): sign.ReturnType
/**
 * Converts a payload (Hex or Bytes) to a base64 string for native module consumption.
 * Handles both Uint8Array and hex string inputs.
 */
export declare function convertPayloadToBase64(
  payload: Hex.Hex | Bytes.Bytes,
): string
/**
 * Storage key prefix for P256 keys
 */
export declare const P256_KEY_PREFIX = 'p256'
/**
 * Generates a unique storage key for a P256 key pair.
 * Uses a timestamp for uniqueness.
 */
export declare function generateStorageKey(prefix?: string): string
/**
 * Validates that a key meets the required format.
 * Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".
 */
export declare function ensureValidKey(key: string): void
/**
 * Thrown when a key pair is invalid or missing required components.
 */
export declare class InvalidKeyPairError extends Errors.BaseError {
  name: string
  constructor()
}
/**
 * Thrown when a signature is invalid or missing.
 */
export declare class InvalidSignatureError extends Errors.BaseError {
  name: string
  constructor()
}
/**
 * Thrown when a key format is invalid.
 */
export declare class InvalidKeyFormatError extends Errors.BaseError {
  name: string
  constructor(key: string)
}
//# sourceMappingURL=utils.d.ts.map
