import type { PublicKey, Signature } from 'ox'
import type { Bytes, Hex } from 'ox'
import { Errors } from 'ox'
import ExpoP256 from './ExpoP256'
import {
  type InvalidKeyFormatError,
  type InvalidKeyPairError,
  type InvalidSignatureError,
  adaptCreateP256KeyPairReturnType,
  adaptGetP256KeyPairReturnType,
  adaptSignWithP256KeyPairReturnType,
  convertPayloadToBase64,
  ensureValidKey,
  generateStorageKey,
} from './internal/utils'

// ============= Constants =============

export const KEY_PREFIX = 'porto-p256-key'

// ============= Errors =============

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

// ============= Types =============

export type KeychainAccessibilityConstant = number

/**
 * Options for P256 key operations.
 */
export type P256Options = {
  /**
   * - Android: Equivalent of the public/private key pair `Alias`.
   * - iOS: The item's service, equivalent to [`kSecAttrService`](https://developer.apple.com/documentation/security/ksecattrservice/).
   * > If the item is set with the `keychainService` option, it will be required to later fetch the value.
   */
  keychainService?: string
  /**
   * Option responsible for enabling the usage of the user authentication methods available on the device while
   * signing with a P256 key.
   * - Android: Equivalent to [`setUserAuthenticationRequired(true)`](https://developer.android.com/reference/android/security/keystore/KeyGenParameterSpec.Builder#setUserAuthenticationRequired(boolean))
   *   (requires API 23).
   * - iOS: Equivalent to [`biometryCurrentSet`](https://developer.apple.com/documentation/security/secaccesscontrolcreateflags/2937192-biometrycurrentset).
   * Note: Authentication requirements are determined at key creation time and cannot be modified afterwards.
   */
  requireAuthentication?: boolean
  /**
   * Custom message displayed to the user while `requireAuthentication` option is turned on.
   */
  authenticationPrompt?: string
  /**
   * Specifies when the stored entry is accessible, using iOS's `kSecAttrAccessible` property.
   * @see Apple's documentation on [keychain item accessibility](https://developer.apple.com/documentation/security/ksecattraccessible/).
   * @default P256.WHEN_UNLOCKED
   * @platform ios
   */
  keychainAccessible?: KeychainAccessibilityConstant
}

// ============= Constants =============

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
  return adaptCreateP256KeyPairReturnType(storageKey, nativeResponse)
}

export declare namespace createKeyPair {
  type Options = P256Options

  type NativeResponse = {
    privateKey: string
    publicKey: string
  }

  type ReturnType = {
    privateKeyStorageKey: string
    publicKey: PublicKey.PublicKey
  }

  type ErrorType =
    | UnsupportedPlatformError
    | InvalidKeyPairError
    | BiometricAuthenticationError
    | Errors.GlobalErrorType
}

/**
 * Retrieves a stored P256 key pair.
 *
 * @throws {UnsupportedPlatformError} When P256 operations are not supported
 * @throws {InvalidKeyFormatError} When the storage key format is invalid
 * @throws {InvalidKeyPairError} When the key pair cannot be retrieved
 * @throws {BiometricAuthenticationError} When biometric authentication is required but not available
 */
export async function getKeyPair(
  options: getKeyPair.Options,
): Promise<getKeyPair.ReturnType> {
  if (!(await isAvailableAsync())) {
    throw new UnsupportedPlatformError()
  }

  if (options.requireAuthentication && !canUseBiometricAuthentication()) {
    throw new BiometricAuthenticationError()
  }

  const { privateKeyStorageKey, ...p256Options } = options
  ensureValidKey(privateKeyStorageKey)
  const nativeResponse = await ExpoP256.getP256KeyPair(
    privateKeyStorageKey,
    p256Options,
  )
  return adaptGetP256KeyPairReturnType(privateKeyStorageKey, nativeResponse)
}

export declare namespace getKeyPair {
  type Options = P256Options & {
    privateKeyStorageKey: string
  }

  type NativeResponse = {
    privateKey: string
    publicKey: string
  } | null

  type ReturnType = {
    privateKeyStorageKey: string
    publicKey: PublicKey.PublicKey
  } | null

  type ErrorType =
    | UnsupportedPlatformError
    | InvalidKeyFormatError
    | InvalidKeyPairError
    | BiometricAuthenticationError
    | Errors.GlobalErrorType
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
export async function sign(options: sign.Options): Promise<sign.ReturnType> {
  try {
    console.info('[P256.sign]:options', options)
    if (!(await isAvailableAsync())) {
      throw new UnsupportedPlatformError()
    }

    if (options.requireAuthentication && !canUseBiometricAuthentication()) {
      throw new BiometricAuthenticationError()
    }

    const { privateKeyStorageKey, payload, ...p256Options } = options
    ensureValidKey(privateKeyStorageKey)
    console.info('[P256.sign]:privateKeyStorageKey', privateKeyStorageKey)
    const base64Payload = convertPayloadToBase64(payload)
    console.info('[P256.sign]:base64Payload', base64Payload)
    const nativeResponse = await ExpoP256.signWithP256KeyPair(
      privateKeyStorageKey,
      base64Payload,
      p256Options,
    )

    console.info('[P256.sign]:nativeResponse', nativeResponse)
    return adaptSignWithP256KeyPairReturnType(nativeResponse)
  } catch (error) {
    console.error('[P256.sign]:error', error)
    throw error
  }
}

export declare namespace sign {
  /** Options for signing data with a P256 key pair */
  type Options = P256Options & {
    /** Storage key referencing the private key in secure storage */
    privateKeyStorageKey: string
    /** Data to sign in either hex or bytes format */
    payload: Hex.Hex | Bytes.Bytes
  }
  /** Raw response from native module */
  type NativeResponse = {
    /** Base64 encoded signature bytes */
    signature: string
    /** DER encoded public key */
    publicKey: string
  } | null
  /** Matches WebCryptoP256.sign return type */
  type ReturnType = Signature.Signature<false>
  type ErrorType =
    | UnsupportedPlatformError
    | InvalidKeyFormatError
    | InvalidSignatureError
    | BiometricAuthenticationError
    | Errors.GlobalErrorType
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
  type ErrorType =
    | UnsupportedPlatformError
    | InvalidSignatureError
    | Errors.GlobalErrorType
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
