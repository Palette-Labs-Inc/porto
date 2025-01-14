import type { PublicKey, Signature } from "ox";
import type * as Bytes from "ox/Bytes";
import type * as Hex from "ox/Hex";

import ExpoP256 from "./ExpoP256";
import {
  adaptCreateP256KeyPairReturnType,
  adaptGetP256KeyPairReturnType,
  adaptSignWithP256KeyPairReturnType,
  convertPayloadToBase64,
  ensureValidKey,
  generateStorageKey,
} from "./internal/utils";

// ============= Constants =============

export const KEY_PREFIX = 'porto-p256-key';

// ============= Errors =============

/** Thrown when P256 operations are attempted on an unsupported platform. */
export class UnsupportedError extends Error {
  override readonly name = 'P256.UnsupportedError'

  constructor() {
    super('P256 operations are not supported on this device')
  }
}

// ============= Types =============

export type KeychainAccessibilityConstant = number;

/**
 * Options for P256 key operations.
 */
export type P256Options = {
  /**
   * - Android: Equivalent of the public/private key pair `Alias`.
   * - iOS: The item's service, equivalent to [`kSecAttrService`](https://developer.apple.com/documentation/security/ksecattrservice/).
   * > If the item is set with the `keychainService` option, it will be required to later fetch the value.
   */
  keychainService?: string;
  /**
   * Option responsible for enabling the usage of the user authentication methods available on the device while
   * signing with a P256 key.
   * - Android: Equivalent to [`setUserAuthenticationRequired(true)`](https://developer.android.com/reference/android/security/keystore/KeyGenParameterSpec.Builder#setUserAuthenticationRequired(boolean))
   *   (requires API 23).
   * - iOS: Equivalent to [`biometryCurrentSet`](https://developer.apple.com/documentation/security/secaccesscontrolcreateflags/2937192-biometrycurrentset).
   * Note: Authentication requirements are determined at key creation time and cannot be modified afterwards.
   */
  requireAuthentication?: boolean;
  /**
   * Custom message displayed to the user while `requireAuthentication` option is turned on.
   */
  authenticationPrompt?: string;
  /**
   * Specifies when the stored entry is accessible, using iOS's `kSecAttrAccessible` property.
   * @see Apple's documentation on [keychain item accessibility](https://developer.apple.com/documentation/security/ksecattraccessible/).
   * @default P256.WHEN_UNLOCKED
   * @platform ios
   */
  keychainAccessible?: KeychainAccessibilityConstant;
};

// ============= Constants =============

/**
 * The data in the keychain item cannot be accessed after a restart until the device has been
 * unlocked once by the user. This may be useful if you need to access the item when the phone
 * is locked.
 */
export const AFTER_FIRST_UNLOCK: KeychainAccessibilityConstant =
  ExpoP256.AFTER_FIRST_UNLOCK;

/**
 * Similar to `AFTER_FIRST_UNLOCK`, except the entry is not migrated to a new device when restoring
 * from a backup.
 */
export const AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY: KeychainAccessibilityConstant =
  ExpoP256.AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY;

/**
 * The data in the keychain item can always be accessed regardless of whether the device is locked.
 * This is the least secure option.
 * @deprecated Use an accessibility level that provides some user protection, such as `AFTER_FIRST_UNLOCK`.
 */
export const ALWAYS: KeychainAccessibilityConstant = ExpoP256.ALWAYS;

/**
 * Similar to `WHEN_UNLOCKED_THIS_DEVICE_ONLY`, except the user must have set a passcode in order to
 * store an entry. If the user removes their passcode, the entry will be deleted.
 */
export const WHEN_PASSCODE_SET_THIS_DEVICE_ONLY: KeychainAccessibilityConstant =
  ExpoP256.WHEN_PASSCODE_SET_THIS_DEVICE_ONLY;

/**
 * Similar to `ALWAYS`, except the entry is not migrated to a new device when restoring from a backup.
 * @deprecated Use an accessibility level that provides some user protection, such as `AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY`.
 */
export const ALWAYS_THIS_DEVICE_ONLY: KeychainAccessibilityConstant =
  ExpoP256.ALWAYS_THIS_DEVICE_ONLY;

/**
 * The data in the keychain item can be accessed only while the device is unlocked by the user.
 */
export const WHEN_UNLOCKED: KeychainAccessibilityConstant =
  ExpoP256.WHEN_UNLOCKED;

/**
 * Similar to `WHEN_UNLOCKED`, except the entry is not migrated to a new device when restoring from
 * a backup.
 */
export const WHEN_UNLOCKED_THIS_DEVICE_ONLY: KeychainAccessibilityConstant =
  ExpoP256.WHEN_UNLOCKED_THIS_DEVICE_ONLY;

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
 */
export async function createKeyPair(
  options: createKeyPair.Options = {},
): Promise<createKeyPair.ReturnType> {
  if (!await isAvailableAsync()) {
    throw new UnsupportedError();
  }
  const storageKey = generateStorageKey(KEY_PREFIX);
  const nativeResponse = await ExpoP256.createP256KeyPair(storageKey, options);
  return adaptCreateP256KeyPairReturnType(nativeResponse);
}

export declare namespace createKeyPair {
  type Options = P256Options;
  /** Raw response from native module containing base64 encoded keys */
  type NativeResponse = {
    privateKey: string; // Reference to key in Secure Enclave/Keystore
    publicKey: string; // DER encoded public key
  };
  /**
   * Return type for createKeyPair that matches WebCryptoP256 interface.
   *
   * @property privateKeyStorageKey - A unique identifier used to reference the private key material
   * stored in the platform's secure storage (Secure Enclave on iOS, Keystore on Android).
   * This is necessary because:
   * 1. Private key material never leaves secure hardware
   * 2. We need a way to reference the same key for future signing operations
   * 3. The key might persist across app restarts while remaining secure
   *
   * @property publicKey - The public key in the standard ox/PublicKey format.
   * This is exported from secure storage and can be shared freely.
   */
  type ReturnType = {
    privateKeyStorageKey: string;
    publicKey: PublicKey.PublicKey;
  };
}

/**
 * Retrieves a stored P256 key pair.
 *
 * Platform Implementation Details:
 * - iOS: Retrieves the key reference from the Keychain and uses it to access the key in the Secure Enclave
 * - Android: Directly retrieves the key from the Android Keystore System using its alias
 *
 * @example
 * ```ts
 * const keyPair = await P256.getKeyPair({
 *   privateKeyStorageKey: "stored-key-reference",
 *   requireAuthentication: true
 * })
 * ```
 *
 * @param options - Options including the storage key and authentication settings
 * @returns Promise resolving to the key pair or null if not found
 */
export async function getKeyPair(
  options: getKeyPair.Options
): Promise<getKeyPair.ReturnType> {
  if (!await isAvailableAsync()) {
    throw new UnsupportedError();
  }
  const { privateKeyStorageKey, ...p256Options } = options;
  ensureValidKey(privateKeyStorageKey);
  const nativeResponse = await ExpoP256.getP256KeyPair(privateKeyStorageKey, p256Options);
  return adaptGetP256KeyPairReturnType(nativeResponse);
}

export declare namespace getKeyPair {
  type Options = P256Options & {
    privateKeyStorageKey: string;
  };
  /** Raw response from native module */
  type NativeResponse = {
    privateKey: string; // Reference to key in secure storage
    publicKey: string; // DER encoded public key
  } | null;
  /** Matches WebCryptoP256.getKeyPair return type */
  type ReturnType = {
    privateKeyStorageKey: string;
    publicKey: PublicKey.PublicKey;
  } | null;
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
 */
export async function sign(options: sign.Options): Promise<sign.ReturnType> {
  if (!await isAvailableAsync()) {
    throw new UnsupportedError();
  }
  const { privateKeyStorageKey, payload, ...p256Options } = options;
  ensureValidKey(privateKeyStorageKey);
  const base64Payload = convertPayloadToBase64(payload);
  const nativeResponse = await ExpoP256.signWithP256KeyPair(
    privateKeyStorageKey,
    base64Payload,
    p256Options,
  );

  return adaptSignWithP256KeyPairReturnType(nativeResponse);
}

export declare namespace sign {
  type Options = P256Options & {
    privateKeyStorageKey: string;
    payload: Hex.Hex | Bytes.Bytes;
  };
  /** Raw response from native module */
  type NativeResponse = {
    signature: string; // Base64 encoded signature bytes
    publicKey: string; // DER encoded public key
  } | null;
  /** Matches WebCryptoP256.sign return type */
  type ReturnType = Signature.Signature<false>;
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
  if (!await isAvailableAsync()) {
    throw new UnsupportedError();
  }
  const { publicKey, signature, payload } = options;
  return await ExpoP256.verifyP256Signature(
    publicKey,
    signature,
    payload,
    options,
  );
}

export declare namespace verify {
  type Options = P256Options & {
    publicKey: string; // DER encoded public key
    signature: string; // Base64 encoded signature
    payload: string; // Data that was signed
  };
  /** Matches WebCryptoP256.verify return type */
  type ReturnType = boolean;
}

/**
 * Checks if P256 operations are available on the current device.
 * This does not check app permissions.
 *
 * @returns Promise resolving to boolean indicating availability
 */
export async function isAvailableAsync(): Promise<boolean> {
  return !!ExpoP256.createP256KeyPair;
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
export function canUseBiometricAuthentication(): boolean {
  return ExpoP256.canUseBiometricAuthentication();
}