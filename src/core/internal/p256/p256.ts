import { PublicKey } from 'ox'
import type * as Hex from 'ox/Hex'
import * as WebCryptoP256 from 'ox/WebCryptoP256'
import type { Key, Permissions, createWebCryptoP256 } from '../key.js'
import { from } from '../key.js'

export const createKeyPair = async <const role extends Key['role']>(
  parameters: createWebCryptoP256.Parameters<role>,
): Promise<Key> => {
  const keyPair = await WebCryptoP256.createKeyPair()
  return fromWebCryptoP256({
    ...parameters,
    keyPair,
  })
}

export const sign = async (options: {
  key: Key
  payload: Hex.Hex
}) => {
  const { privateKey } = options.key

  if (privateKey instanceof CryptoKey) {
    return WebCryptoP256.sign({
      payload: options.payload,
      privateKey: privateKey,
    })
  }

  throw new Error(
    'Private key is not a CryptoKey, the porto package is either not properly resolving native vs. web file paths or your choice of storage is not storing the private key material as a CryptoKey.',
  )
}

/**
 * Instantiates a WebCryptoP256 key from its parameters.
 *
 * @example
 * ```ts
 * import { WebCryptoP256 } from 'ox'
 * import * as Key from './key.js'
 *
 * const keyPair = await WebCryptoP256.createKeyPair()
 *
 * // Admin Key
 * const key = Key.fromWebCryptoP256({
 *   keyPair,
 *   role: 'admin',
 * })
 *
 * // Session Key
 * const key = Key.fromWebCryptoP256({
 *   expiry: 1714857600,
 *   keyPair,
 *   role: 'session',
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns WebCryptoP256 key.
 */
export function fromWebCryptoP256<const role extends Key['role']>(
  parameters: fromWebCryptoP256.Parameters<role>,
) {
  const { keyPair } = parameters
  const { privateKey } = keyPair
  const publicKey = PublicKey.toHex(keyPair.publicKey, {
    includePrefix: false,
  })
  return from({
    canSign: true,
    expiry: parameters.expiry ?? 0,
    permissions: parameters.permissions,
    publicKey,
    role: parameters.role as Key['role'],
    privateKey,
    type: 'p256',
  })
}

export declare namespace fromWebCryptoP256 {
  type Parameters<role extends Key['role']> = {
    /** Expiry. */
    expiry?: Key['expiry'] | undefined
    /** P256 private key. */
    keyPair: Awaited<ReturnType<typeof WebCryptoP256.createKeyPair>>
    /** Permissions. */
    permissions?: Permissions | undefined
    /** Role. */
    role: role | Key['role']
  }
}
