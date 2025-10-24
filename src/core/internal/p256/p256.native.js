import * as ExpoP256 from '@porto/expo-p256'
import { PublicKey } from 'ox'
import { from } from '../key.js'
export const createKeyPair = async (parameters) => {
  const keyPair = await ExpoP256.createKeyPair({
    keychainService: ExpoP256.KEY_PREFIX,
  })
  return fromNativeCryptoP256({
    ...parameters,
    keyPair,
  })
}
export const sign = async (options) => {
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
export function fromNativeCryptoP256(parameters) {
  const { keyPair } = parameters
  const publicKey = PublicKey.toHex(keyPair.publicKey, {
    includePrefix: false,
  })
  return from({
    callScopes: parameters.callScopes,
    expiry: parameters.expiry ?? 0,
    publicKey,
    role: parameters.role,
    canSign: true,
    privateKeyStorageKey: keyPair.privateKeyStorageKey,
    type: 'p256',
  })
}
