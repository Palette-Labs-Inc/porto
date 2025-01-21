// internal/utils.ts
import { Base64, type Bytes, Errors, type Hex } from 'ox'

// ============= Key Management =============

/**
 * Storage key prefix for P256 keys
 */
export const P256_KEY_PREFIX = 'p256'

/**
 * Generates a shorter unique storage key for a P256 key pair.
 * Combines timestamp base36 with random values for uniqueness.
 */
export function generateStorageKey(prefix: string = P256_KEY_PREFIX): string {
  ensureValidKey(prefix)
  const timestamp = Date.now().toString(36)
  const random = Math.random().toString(36).slice(2, 6)
  return `${prefix}-${timestamp}${random}`
}

/**
 * Validates that a key meets the required format.
 * Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".
 */
export function ensureValidKey(key: string) {
  if (!isValidKey(key)) {
    throw new InvalidKeyFormatError(key)
  }
}

/**
 * A regex test to check if a key string matches a format compatible with the native key store.
 */
function isValidKey(key: string): boolean {
  return typeof key === 'string' && /^[\w.-]+$/.test(key)
}

// ============= Payload Conversion =============

/**
 * Converts a payload (Hex or Bytes) to a base64 string for native module consumption.
 * Handles both Uint8Array and hex string inputs.
 */
export function convertPayloadToBase64(payload: Hex.Hex | Bytes.Bytes): string {
  if (payload instanceof Uint8Array) {
    return Base64.fromBytes(payload)
  }
  return Base64.fromHex(payload)
}

// ============= Error Types =============

/**
 * Thrown when a key pair is invalid or missing required components.
 */
export class InvalidKeyPairError extends Errors.BaseError {
  override name = 'InvalidKeyPairError'
  constructor() {
    super('Invalid key pair: missing private key or public key')
  }
}

/**
 * Thrown when a signature is invalid or missing.
 */
export class InvalidSignatureError extends Errors.BaseError {
  override name = 'InvalidSignatureError'
  constructor() {
    super('Invalid signature: signature data is missing or malformed')
  }
}

/**
 * Thrown when a key format is invalid.
 */
export class InvalidKeyFormatError extends Errors.BaseError {
  override name = 'InvalidKeyFormatError'
  constructor(key: string) {
    super(
      `Invalid key format: "${key}". Keys must contain only alphanumeric characters, ".", "-", and "_".`,
    )
  }
}