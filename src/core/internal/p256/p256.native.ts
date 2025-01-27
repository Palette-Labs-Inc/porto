import * as ExpoP256 from '@porto/expo-p256'
import { PublicKey } from 'ox'
import type * as Hex from 'ox/Hex'
import type { CallScopes, Key, createWebCryptoP256 } from '../key.js'
import { from } from '../key.js'

export const createKeyPair = async <const role extends Key['role']>(
  parameters: createWebCryptoP256.Parameters<role>,
): Promise<Key> => {
  const keyPair = await ExpoP256.createKeyPair({
    keychainService: ExpoP256.KEY_PREFIX,
  })
  console.info('[p256.native: createKeyPair] keyPair')
  console.info(keyPair)
  return fromNativeCryptoP256({
    ...parameters,
    keyPair,
  })
}

export const sign = async (options: {
  key: Key
  payload: Hex.Hex
}) => {
  const { privateKeyStorageKey } = options.key
  if (privateKeyStorageKey) {
    return ExpoP256.sign({
      requireAuthentication: false,
      payload: options.payload,
      keychainService: ExpoP256.KEY_PREFIX,
      privateKeyStorageKey,
    })
  }
  throw new Error(
    'Invalid key type for native platform, the package is not properly resolving native vs. web file paths.',
  )
}

/**
 * Instantiates a native P256 key from its parameters.
 *
 * @example
 * ```ts
 * import * as Key from './key.js'
 *
 * const keyPair = await P256.createKeyPair()
 *
 * // Admin Key
 * const key = Key.fromNativeCryptoP256({
 *   keyPair,
 *   role: 'admin',
 * })
 *
 * // Session Key
 * const key = Key.fromNativeCryptoP256({
 *   expiry: 1714857600,
 *   keyPair,
 *   role: 'session',
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns P256 key.
 */
export function fromNativeCryptoP256<const role extends Key['role']>(
  parameters: fromNativeCryptoP256.Parameters<role>,
) {
  const { keyPair } = parameters
  const publicKey = PublicKey.toHex(keyPair.publicKey, {
    includePrefix: false,
  })
  return from({
    callScopes: parameters.callScopes,
    expiry: parameters.expiry ?? 0,
    publicKey,
    role: parameters.role as Key['role'],
    canSign: true,
    privateKeyStorageKey: keyPair.privateKeyStorageKey,
    type: 'p256',
  })
}

export declare namespace fromNativeCryptoP256 {
  type Parameters<role extends Key['role'] = Key['role']> = {
    /** Call scopes. */
    callScopes?: CallScopes | undefined
    /** Expiry. */
    expiry?: Key['expiry'] | undefined
    /** P256 key pair. */
    keyPair: ExpoP256.createKeyPair.ReturnType
    /** Role. */
    role: role | Key['role']
  }
}
