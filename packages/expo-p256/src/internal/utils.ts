import { fromByteArray } from "base64-js";
import { Buffer } from "buffer";
import { PublicKey, Hex, Bytes } from "ox";

import { createKeyPair, getKeyPair, sign } from "../P256";

// ============= Type Adapters =============

/**
 * Adapts the native response from createKeyPair to the WebCryptoP256-compatible format.
 * Converts the base64 encoded public key to the ox PublicKey format.
 */
export function adaptCreateP256KeyPairReturnType(
  nativeResponse: createKeyPair.NativeResponse,
): createKeyPair.ReturnType {
  return {
    privateKeyStorageKey: nativeResponse.privateKey,
    publicKey: PublicKey.from(
      Buffer.from(nativeResponse.publicKey, "base64"),
    ) as PublicKey.PublicKey,
  };
}

/**
 * Adapts the native response from getKeyPair to the WebCryptoP256-compatible format.
 * Returns null if no key pair exists, otherwise converts to the same format as createKeyPair.
 */
export function adaptGetP256KeyPairReturnType(
  nativeResponse: getKeyPair.NativeResponse,
): getKeyPair.ReturnType {
  if (!nativeResponse) return null;
  return adaptCreateP256KeyPairReturnType(nativeResponse);
}

/**
 * Adapts the native signature response to the WebCryptoP256-compatible format.
 * Extracts r and s values from the ASN.1 DER encoded signature.
 */
export function adaptSignWithP256KeyPairReturnType(
  nativeResponse: sign.NativeResponse,
): sign.ReturnType {
  if (!nativeResponse) throw new Error("No native response");

  const signatureBytes = Buffer.from(nativeResponse.signature, "base64");
  const r = BigInt("0x" + signatureBytes.slice(0, 32).toString("hex"));
  const s = BigInt("0x" + signatureBytes.slice(32).toString("hex"));
  return { r, s };
}

// ============= Payload Conversion =============

/**
 * Converts a payload (Hex or Bytes) to a base64 string for native module consumption.
 * Handles both Uint8Array and hex string inputs.
 */
export function convertPayloadToBase64(payload: Hex.Hex | Bytes.Bytes): string {
  if (payload instanceof Uint8Array) {
    return fromByteArray(payload);
  }
  return fromByteArray(Buffer.from(payload.slice(2), "hex"));
}

// ============= Key Management =============

/**
 * Generates a unique storage key for a P256 key pair.
 * Uses a timestamp for uniqueness.
 */
export function generateStorageKey(prefix: string): string {
  return `${prefix}-${Date.now()}`;
}

/**
 * Validates that a key meets the required format.
 * Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".
 */
export function ensureValidKey(key: string) {
  if (!isValidKey(key)) {
    throw new Error(
      'Invalid key provided to P256. Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".',
    );
  }
}

/**
 * Tests if a key string matches a format compatible with the native key store.
 * @internal
 */
function isValidKey(key: string) {
  return typeof key === "string" && /^[\w.-]+$/.test(key);
}