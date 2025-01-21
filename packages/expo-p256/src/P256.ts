import { type Bytes, Hex, PublicKey, Signature } from 'ox'
import { Base64, Errors } from 'ox'

import ExpoP256 from './ExpoP256'
import {
  type InvalidKeyFormatError,
  InvalidKeyPairError,
  InvalidSignatureError,
  convertPayloadToBase64,
  ensureValidKey,
  generateStorageKey,
} from './internal/utils'

// ============= Types =============

/**
 * P256 key stored in secure hardware.
 * The public key follows the ox PublicKey format.
 * - iOS: Private key is stored in Secure Enclave, with reference in Keychain
 * - Android: Key pair is stored in Android Keystore System
 */
export type P256Key = {
  publicKey: PublicKey.PublicKey
  privateKeyStorageKey: string
}

/** Options for P256 key operations */
export type P256Options = {
  /**
   * acts like a namespace or directory in the keychain/keystore.
   * - if used, this parameter is required when getting a key pair or signing with a key pair.
   * - Android: Equivalent of the public/private key pair `Alias`.
   * - iOS: The item's service namespace, equivalent to [`kSecAttrService`].
   * @see Apple's documentation on [kSecAttrService](https://developer.apple.com/documentation/security/ksecattrservice/).
   */
  keychainService?: string
  /**
   * Option for enabling user authentication methods while signing.
   * - Android: Equivalent to [`setUserAuthenticationRequired(true)`](https://developer.android.com/reference/android/security/keystore/KeyGenParameterSpec.Builder#setUserAuthenticationRequired(boolean))
   *   (requires API 23).
   * - iOS: Equivalent to [`biometryCurrentSet`](https://developer.apple.com/documentation/security/secaccesscontrolcreateflags/2937192-biometrycurrentset).
   * Note: Authentication requirements are determined at key creation time.
   * @default false
   */
  requireAuthentication?: boolean
  /**
   * Custom message displayed during authentication.
   * @default ""
   */
  authenticationPrompt?: string
  /**
   * iOS keychain accessibility level.
   * Specifies when the stored entry is accessible, using iOS's `kSecAttrAccessible` property.
   * @see Apple's documentation on [keychain item accessibility](https://developer.apple.com/documentation/security/ksecattraccessible/).
   * @default SecureStore.WHEN_UNLOCKED
   * @platform ios
   */
  keychainAccessible?: KeychainAccessibilityConstant
}

// ============= Constants =============

export const KEY_PREFIX = 'porto-p256-key'

/**
 * The data in the keychain item cannot be accessed after a restart until the device has been
 * unlocked once by the user. This may be useful if you need to access the item when the phone
 * is locked.
 */
export const AFTER_FIRST_UNLOCK: KeychainAccessibilityConstant =
  ExpoP256.AFTER_FIRST_UNLOCK

/**
 * Similar to `AFTER_FIRST_UNLOCK`, except the entry is not migrated to a new device when restoring
 * from a backup.
 */
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: KeychainAccessibilityConstant =
  ExpoP256.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY

/**
 * The data in the keychain item can always be accessed regardless of whether the device is locked.
 * This is the least secure option.
 * @deprecated Use an accessibility level that provides some user protection, such as `AFTER_FIRST_UNLOCK`.
 */
export const ALWAYS: KeychainAccessibilityConstant = ExpoP256.ALWAYS

/**
 * Similar to `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, except the user must have set a passcode in order to
 * store an entry. If the user removes their passcode, the entry will be deleted.
 */
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: KeychainAccessibilityConstant =
  ExpoP256.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY

/**
 * Similar to `ALWAYS`, except the entry is not migrated to a new device when restoring from a backup.
 * @deprecated Use an accessibility level that provides some user protection, such as `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`.
 */
export const ALWAYS_THIS_DEVICE_ONLY: KeychainAccessibilityConstant =
  ExpoP256.ALWAYS_THIS_DEVICE_ONLY

/**
 * The data in the keychain item can be accessed only while the device is unlocked by the user.
 */
export const WHEN_UNLOCKED: KeychainAccessibilityConstant =
  ExpoP256.WHEN_UNLOCKED

/**
 * Similar to `WHEN_UNLOCKED`, except the entry is not migrated to a new device when restoring from
 * a backup.
 */
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY: KeychainAccessibilityConstant =
  ExpoP256.WHEN_UNLOCKED_THIS_DEVICE_ONLY

// ============= Error Types =============

/** Thrown when P256 operations are attempted on an unsupported platform. */
export class UnsupportedPlatformError extends Errors.BaseError {
  override readonly name = 'P256.UnsupportedPlatformError'
  constructor() {
    super('P256 operations are not supported on this device')
  }
}

/** Thrown when biometric authentication is required but not available. */
export class BiometricAuthenticationError extends Errors.BaseError {
  override readonly name = 'P256.BiometricAuthenticationError'
  constructor() {
    super('Biometric authentication is not available on this device')
  }
}

export declare namespace P256Errors {
  type CommonErrorType =
    | UnsupportedPlatformError
    | BiometricAuthenticationError
    | Errors.GlobalErrorType
}

// ============= Types =============

export type KeychainAccessibilityConstant = number

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
 * const key = await P256.createKeyPair({
 *   requireAuthentication: true,
 *   authenticationPrompt: "Please authenticate to create a key pair"
 * })
 * ```
 */
export async function createKeyPair(
  options: createKeyPair.Options = {},
): Promise<createKeyPair.ReturnType> {
  if (!(await isAvailableAsync())) {
    throw new UnsupportedPlatformError()
  }

  if (options.requireAuthentication && !canUseBiometricAuthentication()) {
    throw new BiometricAuthenticationError()
  }

  const storageKey = generateStorageKey()
  const nativeResponse = await ExpoP256.createP256KeyPair(storageKey, options)
  return fromNativeKeyPair({
    storageKey,
    privateKey: nativeResponse.privateKey,
    publicKey: nativeResponse.publicKey,
  })
}

export declare namespace createKeyPair {
  type Options = P256Options
  type ReturnType = P256Key
  type ErrorType = P256Errors.CommonErrorType | fromNativeKeyPair.ErrorType
}

/**
 * Creates a P256Key from a native key pair response.
 *
 * This function handles the conversion of native key material into the standardized
 * P256Key format used throughout the library.
 *
 * @example
 * ```ts
 * const key = P256.fromNativeKeyPair({
 *   storageKey: "key-reference",
 *   privateKey: "base64-private-key",
 *   publicKey: "base64-der-public-key"
 * })
 * ```
 */
export function fromNativeKeyPair(
  parameters: fromNativeKeyPair.Parameters,
): fromNativeKeyPair.ReturnType {
  const { storageKey, privateKey, publicKey } = parameters

  if (!privateKey || !publicKey) {
    throw new InvalidKeyPairError()
  }

  return {
    publicKey: PublicKey.from(Base64.toBytes(publicKey)) as PublicKey.PublicKey,
    privateKeyStorageKey: storageKey,
  }
}

export declare namespace fromNativeKeyPair {
  type Parameters = {
    storageKey: string // used to retrieve the key pair from the native module's keychain/keystore
    privateKey: string // base64 reference
    publicKey: string // base64 DER
  }
  type ReturnType = P256Key
  type ErrorType = InvalidKeyPairError
}

/**
 * Retrieves a previously created P256 key pair.
 *
 * If the key was created with requireAuthentication=true, this operation may
 * trigger a biometric authentication prompt.
 *
 * @example
 * ```ts
 * const key = await P256.getKeyPair({
 *   privateKeyStorageKey: "stored-key-reference"
 * })
 * ```
 */
export async function getKeyPair(
  options: getKeyPair.Options,
): Promise<getKeyPair.ReturnType> {
  if (!(await isAvailableAsync())) {
    throw new UnsupportedPlatformError()
  }

  const { privateKeyStorageKey, ...p256Options } = options
  ensureValidKey(privateKeyStorageKey)

  const nativeResponse = await ExpoP256.getP256KeyPair(
    privateKeyStorageKey,
    p256Options,
  )

  if (!nativeResponse) return null
  return fromNativeKeyPair({
    storageKey: privateKeyStorageKey,
    privateKey: nativeResponse.privateKey,
    publicKey: nativeResponse.publicKey,
  })
}

export declare namespace getKeyPair {
  type Options = P256Options & {
    privateKeyStorageKey: string
  }
  type ReturnType = P256Key | null
  type ErrorType =
    | P256Errors.CommonErrorType
    | InvalidKeyFormatError
    | fromNativeKeyPair.ErrorType
}

/**
 * Signs data using a P256 key pair.
 * The signature is produced in ASN.1 DER format and then converted to raw r,s format.
 * The signing operation uses SHA-256 for hashing.
 *
 * Note: If the key was created with requireAuthentication=true, this operation will
 * require user authentication regardless of the options passed to this function.
 *
 * @example
 * ```ts
 * const signature = await P256.sign({
 *   key,
 *   payload: "0xdeadbeef"
 * })
 * ```
 */
export async function sign(options: sign.Options): Promise<sign.ReturnType> {
  if (!(await isAvailableAsync())) {
    throw new UnsupportedPlatformError()
  }

  const { privateKeyStorageKey, payload, ...p256Options } = options

  const base64Payload = convertPayloadToBase64(payload)
  const nativeResponse = await ExpoP256.signWithP256KeyPair(
    privateKeyStorageKey,
    base64Payload,
    p256Options,
  )

  return fromNativeSignature({
    signature: nativeResponse.signature,
  })
}

export declare namespace sign {
  type Options = P256Options & {
    privateKeyStorageKey: string
    payload: Hex.Hex | Bytes.Bytes
  }
  type ReturnType = Signature.Signature<false>
  type ErrorType = P256Errors.CommonErrorType | fromNativeSignature.ErrorType
}

/**
 * Creates a P256Key from a native ASN.1 DER encoded signature.
 * Converts to the standard ox Signature format.
 *
 * @example
 * ```ts
 * const signature = P256.fromNativeSignature({
 *   signature: "base64-der-signature"
 * })
 * ```
 */
export function fromNativeSignature(
  parameters: fromNativeSignature.Parameters,
): fromNativeSignature.ReturnType {
  const { signature } = parameters
  if (!signature) {
    throw new InvalidSignatureError()
  }

  const signatureBytes = Base64.toBytes(signature)
  const signatureHex = Hex.fromBytes(signatureBytes)
  const { r, s } = Signature.fromDerHex(signatureHex)
  return { r, s }
}

export declare namespace fromNativeSignature {
  type Parameters = {
    signature: string // base64 DER
  }
  type ReturnType = Signature.Signature<false>
  type ErrorType = InvalidSignatureError
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
 */
export async function verify(
  options: verify.Options,
): Promise<verify.ReturnType> {
  if (!(await isAvailableAsync())) {
    throw new UnsupportedPlatformError()
  }

  const { publicKey, signature, payload } = options
  return await ExpoP256.verifyP256Signature(
    publicKey,
    signature,
    payload,
    options,
  )
}

export declare namespace verify {
  type Options = P256Options & {
    /** DER encoded public key */
    publicKey: string
    /** Base64 encoded signature */
    signature: string
    /** Data that was signed */
    payload: string
  }
  /** Matches WebCryptoP256.verify return type */
  type ReturnType = boolean
  type ErrorType = P256Errors.CommonErrorType | InvalidSignatureError
}

/**
 * Checks if P256 operations are available on the current device.
 * This does not check app permissions.
 *
 * @returns Promise resolving to boolean indicating availability
 */
export async function isAvailableAsync(): Promise<boolean> {
  return !!ExpoP256.createP256KeyPair
}

/**
 * Deletes a stored key pair.
 *
 * @param key - Storage key of the key pair to delete
 * @param options - Optional configuration
 */
export async function deleteItemAsync(
  key: string,
  options: P256Options = {},
): Promise<void> {
  await ExpoP256.deleteValueWithKeyAsync(key, options)
}

/**
 * Checks if biometric authentication can be used for P256 operations.
 * Returns false on tvOS.
 *
 * @platform android
 * @platform ios
 * @returns boolean indicating if biometric authentication is available
 */
export function canUseBiometricAuthentication(): boolean {
  return ExpoP256.canUseBiometricAuthentication()
}
