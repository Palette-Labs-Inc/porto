import { Errors } from 'ox';
import ExpoP256 from './ExpoP256';
import { adaptCreateP256KeyPairReturnType, adaptGetP256KeyPairReturnType, adaptSignWithP256KeyPairReturnType, convertPayloadToBase64, ensureValidKey, generateStorageKey, } from './internal/utils';
// ============= Constants =============
export const KEY_PREFIX = 'porto-p256-key';
// ============= Errors =============
/** Thrown when P256 operations are attempted on an unsupported platform. */
export class UnsupportedPlatformError extends Errors.BaseError {
    name = 'P256.UnsupportedPlatformError';
    constructor() {
        super('P256 operations are not supported on this device');
    }
}
/** Thrown when biometric authentication is required but not available. */
export class BiometricAuthenticationError extends Errors.BaseError {
    name = 'P256.BiometricAuthenticationError';
    constructor() {
        super('Biometric authentication is not available on this device');
    }
}
// ============= Constants =============
/**
 * The data in the keychain item cannot be accessed after a restart until the device has been
 * unlocked once by the user. This may be useful if you need to access the item when the phone
 * is locked.
 */
export const AFTER_FIRST_UNLOCK = ExpoP256.AFTER_FIRST_UNLOCK;
/**
 * Similar to `AFTER_FIRST_UNLOCK`, except the entry is not migrated to a new device when restoring
 * from a backup.
 */
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY = ExpoP256.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY;
/**
 * The data in the keychain item can always be accessed regardless of whether the device is locked.
 * This is the least secure option.
 * @deprecated Use an accessibility level that provides some user protection, such as `AFTER_FIRST_UNLOCK`.
 */
export const ALWAYS = ExpoP256.ALWAYS;
/**
 * Similar to `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, except the user must have set a passcode in order to
 * store an entry. If the user removes their passcode, the entry will be deleted.
 */
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY = ExpoP256.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY;
/**
 * Similar to `ALWAYS`, except the entry is not migrated to a new device when restoring from a backup.
 * @deprecated Use an accessibility level that provides some user protection, such as `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`.
 */
export const ALWAYS_THIS_DEVICE_ONLY = ExpoP256.ALWAYS_THIS_DEVICE_ONLY;
/**
 * The data in the keychain item can be accessed only while the device is unlocked by the user.
 */
export const WHEN_UNLOCKED = ExpoP256.WHEN_UNLOCKED;
/**
 * Similar to `WHEN_UNLOCKED`, except the entry is not migrated to a new device when restoring from
 * a backup.
 */
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY = ExpoP256.WHEN_UNLOCKED_THIS_DEVICE_ONLY;
// ============= Core Functions =============
/**
 * Creates a P256 key pair and stores it securely.
 *
 * Platform Implementation Details:
 * - iOS:
 *   - The private key is generated and stored in the Secure Enclave
 *   - A reference to this key is stored in the Keychain
 *   - If requireAuthentication is true, the key is created with `.userPresence` flag
 *   - Authentication and NSFaceIDUsageDescription is required for signing if `requireAuthentication` is true
 *
 * - Android:
 *   - The key pair is generated and stored directly in the Android Keystore System
 *   - If requireAuthentication is true, the authentication requirement is permanently bound to the key
 *   - This affects all subsequent operations with this key
 *
 * @example
 * ```ts
 * const { publicKey, privateKeyStorageKey } = await P256.createKeyPair({
 *   requireAuthentication: true,
 *   authenticationPrompt: "Please authenticate to create a key pair"
 * })
 * ```
 *
 * @param options - Configuration options for key pair creation
 * @returns Promise resolving to the key pair
 * @throws {UnsupportedPlatformError} When P256 operations are not supported
 * @throws {InvalidKeyPairError} When key pair creation fails
 * @throws {BiometricAuthenticationError} When biometric authentication is required but not available
 */
export async function createKeyPair(options = {}) {
    if (!(await isAvailableAsync())) {
        throw new UnsupportedPlatformError();
    }
    if (options.requireAuthentication && !canUseBiometricAuthentication()) {
        throw new BiometricAuthenticationError();
    }
    const storageKey = generateStorageKey(KEY_PREFIX);
    const nativeResponse = await ExpoP256.createP256KeyPair(storageKey, options);
    return adaptCreateP256KeyPairReturnType(nativeResponse);
}
/**
 * Retrieves a stored P256 key pair.
 *
 * @throws {UnsupportedPlatformError} When P256 operations are not supported
 * @throws {InvalidKeyFormatError} When the storage key format is invalid
 * @throws {InvalidKeyPairError} When the key pair cannot be retrieved
 * @throws {BiometricAuthenticationError} When biometric authentication is required but not available
 */
export async function getKeyPair(options) {
    if (!(await isAvailableAsync())) {
        throw new UnsupportedPlatformError();
    }
    if (options.requireAuthentication && !canUseBiometricAuthentication()) {
        throw new BiometricAuthenticationError();
    }
    const { privateKeyStorageKey, ...p256Options } = options;
    ensureValidKey(privateKeyStorageKey);
    const nativeResponse = await ExpoP256.getP256KeyPair(privateKeyStorageKey, p256Options);
    return adaptGetP256KeyPairReturnType(nativeResponse);
}
/**
 * Signs data using a stored P256 key pair.
 *
 * Note: If the key was created with requireAuthentication=true, this operation will
 * require user authentication regardless of the options passed to this function.
 *
 * @example
 * ```ts
 * const signature = await P256.sign({
 *   privateKeyStorageKey: "stored-key-reference",
 *   payload: "0xdeadbeef",
 *   requireAuthentication: true
 * })
 * ```
 *
 * @param options - Signing options including key, payload, and authentication settings
 * @returns Promise resolving to the signature
 * @throws {UnsupportedPlatformError} When P256 operations are not supported
 * @throws {InvalidKeyFormatError} When the storage key format is invalid
 * @throws {InvalidSignatureError} When signing fails
 * @throws {BiometricAuthenticationError} When biometric authentication is required but not available
 */
export async function sign(options) {
    if (!(await isAvailableAsync())) {
        throw new UnsupportedPlatformError();
    }
    if (options.requireAuthentication && !canUseBiometricAuthentication()) {
        throw new BiometricAuthenticationError();
    }
    const { privateKeyStorageKey, payload, ...p256Options } = options;
    ensureValidKey(privateKeyStorageKey);
    const base64Payload = convertPayloadToBase64(payload);
    const nativeResponse = await ExpoP256.signWithP256KeyPair(privateKeyStorageKey, base64Payload, p256Options);
    return adaptSignWithP256KeyPairReturnType(nativeResponse);
}
/**
 * Verifies a signature using a P256 public key.
 *
 * @example
 * ```ts
 * const isValid = await P256.verify({
 *   publicKey: publicKeyDER,
 *   signature: signatureBase64,
 *   payload: "0xdeadbeef"
 * })
 * ```
 *
 * @param options - Verification options including public key, signature, and payload
 * @returns Promise resolving to boolean indicating validity
 * @throws {UnsupportedPlatformError} When P256 operations are not supported
 * @throws {InvalidSignatureError} When verification fails due to invalid signature format
 */
export async function verify(options) {
    if (!(await isAvailableAsync())) {
        throw new UnsupportedPlatformError();
    }
    const { publicKey, signature, payload } = options;
    return await ExpoP256.verifyP256Signature(publicKey, signature, payload, options);
}
/**
 * Checks if P256 operations are available on the current device.
 * This does not check app permissions.
 *
 * @returns Promise resolving to boolean indicating availability
 */
export async function isAvailableAsync() {
    return !!ExpoP256.createP256KeyPair;
}
/**
 * Deletes a stored key pair.
 *
 * @param key - Storage key of the key pair to delete
 * @param options - Optional configuration
 */
export async function deleteItemAsync(key, options = {}) {
    await ExpoP256.deleteValueWithKeyAsync(key, options);
}
/**
 * Checks if biometric authentication can be used for P256 operations.
 * Returns false on tvOS.
 *
 * @platform android
 * @platform ios
 * @returns boolean indicating if biometric authentication is available
 */
export function canUseBiometricAuthentication() {
    return ExpoP256.canUseBiometricAuthentication();
}
//# sourceMappingURL=P256.js.map