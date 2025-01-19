import { Base64, Errors, Hex, PublicKey, Signature } from 'ox';
// ============= Type Adapters =============
/**
 * Converts a native key pair response to the WebCryptoP256-compatible format.
 * @internal
 */
function convertNativeKeyPairToWebCrypto(privateKeyStorageKey, nativeKeyPair) {
    if (!nativeKeyPair.privateKey || !nativeKeyPair.publicKey) {
        throw new InvalidKeyPairError();
    }
    return {
        privateKeyStorageKey: privateKeyStorageKey,
        publicKey: PublicKey.from(Base64.toBytes(nativeKeyPair.publicKey)),
    };
}
/**
 * Adapts the native response from createKeyPair to the WebCryptoP256-compatible format.
 * Converts the base64 encoded public key to the ox PublicKey format.
 */
export function adaptCreateP256KeyPairReturnType(privateKeyStorageKey, nativeResponse) {
    return convertNativeKeyPairToWebCrypto(privateKeyStorageKey, nativeResponse);
}
/**
 * Adapts the native response from getKeyPair to the WebCryptoP256-compatible format.
 * Returns null if no key pair exists, otherwise converts to the WebCryptoP256 format.
 */
export function adaptGetP256KeyPairReturnType(privateKeyStorageKey, nativeResponse) {
    if (!nativeResponse)
        return null;
    return convertNativeKeyPairToWebCrypto(privateKeyStorageKey, nativeResponse);
}
/**
 * Adapts the native signature response to the WebCryptoP256-compatible format.
 * Extracts r and s values from the ASN.1 DER encoded signature.
 */
export function adaptSignWithP256KeyPairReturnType(nativeResponse) {
    if (!nativeResponse?.signature) {
        throw new InvalidSignatureError();
    }
    const signatureBytes = Base64.toBytes(nativeResponse.signature);
    const signatureHex = Hex.fromBytes(signatureBytes);
    const { r, s } = Signature.fromDerHex(signatureHex);
    return { r, s };
}
// ============= Payload Conversion =============
/**
 * Converts a payload (Hex or Bytes) to a base64 string for native module consumption.
 * Handles both Uint8Array and hex string inputs.
 */
export function convertPayloadToBase64(payload) {
    if (payload instanceof Uint8Array) {
        return Base64.fromBytes(payload);
    }
    return Base64.fromHex(payload);
}
// ============= Key Management =============
/**
 * Storage key prefix for P256 keys
 */
export const P256_KEY_PREFIX = 'p256';
/**
 * Generates a shorter unique storage key for a P256 key pair.
 * Combines timestamp base36 with random values for uniqueness.
 */
export function generateStorageKey(prefix = P256_KEY_PREFIX) {
    ensureValidKey(prefix);
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).slice(2, 6);
    return `${prefix}-${timestamp}${random}`;
}
/**
 * Validates that a key meets the required format.
 * Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".
 */
export function ensureValidKey(key) {
    if (!isValidKey(key)) {
        throw new InvalidKeyFormatError(key);
    }
}
/**
 * Tests if a key string matches a format compatible with the native key store.
 * @internal
 */
function isValidKey(key) {
    return typeof key === 'string' && /^[\w.-]+$/.test(key);
}
// ============= Error Types =============
/**
 * Thrown when a key pair is invalid or missing required components.
 */
export class InvalidKeyPairError extends Errors.BaseError {
    name = 'InvalidKeyPairError';
    constructor() {
        super('Invalid key pair: missing private key or public key');
    }
}
/**
 * Thrown when a signature is invalid or missing.
 */
export class InvalidSignatureError extends Errors.BaseError {
    name = 'InvalidSignatureError';
    constructor() {
        super('Invalid signature: signature data is missing or malformed');
    }
}
/**
 * Thrown when a key format is invalid.
 */
export class InvalidKeyFormatError extends Errors.BaseError {
    name = 'InvalidKeyFormatError';
    constructor(key) {
        super(`Invalid key format: "${key}". Keys must not be empty and contain only alphanumeric characters, ".", "-", and "_".`);
    }
}
//# sourceMappingURL=utils.js.map