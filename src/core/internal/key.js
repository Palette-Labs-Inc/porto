import * as AbiParameters from 'ox/AbiParameters'
import * as Address from 'ox/Address'
import * as Bytes from 'ox/Bytes'
import * as Hash from 'ox/Hash'
import * as Hex from 'ox/Hex'
import * as Json from 'ox/Json'
import * as P256 from 'ox/P256'
import * as PublicKey from 'ox/PublicKey'
import * as Secp256k1 from 'ox/Secp256k1'
import * as Signature from 'ox/Signature'
import * as P256Module from './p256'
import * as WebAuthNModule from './webauthn'
/** Serialized key type to key type mapping. */
export const fromSerializedKeyType = {
  0: 'p256',
  1: 'webauthn-p256',
  2: 'secp256k1',
}
/** Serialized spend period to period mapping. */
export const fromSerializedSpendPeriod = {
  0: 'minute',
  1: 'hour',
  2: 'day',
  3: 'week',
  4: 'month',
  5: 'year',
}
/** Key type to serialized key type mapping. */
export const toSerializedKeyType = {
  p256: 0,
  'webauthn-p256': 1,
  secp256k1: 2,
}
/** Period to serialized period mapping. */
export const toSerializedSpendPeriod = {
  minute: 0,
  hour: 1,
  day: 2,
  week: 3,
  month: 4,
  year: 5,
}
/**
 * Creates a random P256 key.
 *
 * @example
 * ```ts
 * import * as Key from './key.js'
 *
 * // Admin Key
 * const key = Key.createP256({
 *   role: 'admin',
 * })
 *
 * // Session Key
 * const key = Key.createP256({
 *   expiry: 1714857600,
 *   role: 'session',
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns P256 key.
 */
export function createP256(parameters) {
  const privateKey = P256.randomPrivateKey()
  return fromP256({
    ...parameters,
    privateKey,
  })
}
/**
 * Creates a random Secp256k1 key.
 *
 * @example
 * ```ts
 * import * as Key from './key.js'
 *
 * // Admin Key
 * const key = Key.createSecp256k1({
 *   role: 'admin',
 * })
 *
 * // Session Key
 * const key = Key.createSecp256k1({
 *   expiry: 1714857600,
 *   role: 'session',
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns Secp256k1 key.
 */
export function createSecp256k1(parameters) {
  const privateKey = Secp256k1.randomPrivateKey()
  return fromSecp256k1({
    ...parameters,
    privateKey,
  })
}
/**
 * Creates a WebAuthnP256 key.
 *
 * @example
 * ```ts
 * import { Bytes } from 'ox'
 * import * as Key from './key.js'
 *
 * // Admin Key
 * const key = Key.createWebAuthnP256({
 *   label: 'My Key',
 *   role: 'admin',
 *   userId: Bytes.from('0x0000000000000000000000000000000000000000'),
 * })
 *
 * // Session Key
 * const key = Key.createWebAuthnP256({
 *   expiry: 1714857600,
 *   label: 'My Key',
 *   role: 'session',
 *   userId: Bytes.from('0x0000000000000000000000000000000000000000'),
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns WebAuthnP256 key.
 */
export async function createWebAuthnP256(parameters) {
  const { createFn, label, rpId, userId } = parameters
  const credential = await WebAuthNModule.createCredential({
    authenticatorSelection: {
      requireResidentKey: false,
      residentKey: 'preferred',
      userVerification: 'required',
    },
    createFn,
    rp: rpId
      ? {
          id: rpId,
          name: rpId,
        }
      : undefined,
    user: {
      displayName: label,
      name: label,
      id: userId,
    },
  })
  return fromWebAuthnP256({
    ...parameters,
    credential: {
      id: credential.id,
      publicKey: credential.publicKey,
    },
  })
}
/**
 * Creates a random WebCryptoP256 key.
 *
 * @example
 * ```ts
 * import * as Key from './key.js'
 *
 * // Admin Key
 * const key = Key.createWebCryptoP256({
 *   role: 'admin',
 * })
 *
 * // Session Key
 * const key = Key.createWebCryptoP256({
 *   expiry: 1714857600,
 *   role: 'session',
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns WebCryptoP256 key.
 */
export async function createWebCryptoP256(parameters) {
  return await P256Module.createKeyPair(parameters)
}
/**
 * Deserializes a key from its serialized format.
 *
 * @example
 * ```ts
 * import * as Key from './key.js'
 *
 * const key = Key.deserialize({
 *   expiry: 0,
 *   isSuperAdmin: false,
 *   keyType: 0,
 *   publicKey: '0x04ec0effa5f2f378cbf7fd2fa7ca1e8dc51cf777c129fa1c00a0e9a9205f2e511ff3f20b34a4e0b50587d055c0e0fad33d32cf1147d3bb2538fbab0d15d8e65008',
 * })
 * ```
 *
 * @param serialized - Serialized key.
 * @returns Key.
 */
export function deserialize(serialized) {
  return {
    expiry: serialized.expiry,
    publicKey: serialized.publicKey,
    role: serialized.isSuperAdmin ? 'admin' : 'session',
    canSign: false,
    type: fromSerializedKeyType[serialized.keyType],
  }
}
/**
 * Instantiates a key from its parameters.
 *
 * @example
 * ```ts
 * import { P256 } from 'ox'
 * import * as Key from './key.js'
 *
 * const privateKey = P256.randomPrivateKey()
 * const publicKey = P256.getPublicKey({ privateKey })
 *
 * const key = Key.from({
 *   expiry: 0,
 *   publicKey,
 *   role: 'admin',
 *   async sign({ payload }) {
 *     return P256.sign({ payload, privateKey })
 *   },
 *   type: 'p256',
 * })
 * ```
 *
 * @param key - Key.
 * @returns Key.
 */
export function from(key) {
  if ('isSuperAdmin' in key) return deserialize(key)
  return { ...key, expiry: key.expiry ?? 0 }
}
/**
 * Instantiates a P256 key from its parameters.
 *
 * @example
 * ```ts
 * import { P256 } from 'ox'
 * import * as Key from './key.js'
 *
 * // Admin Key
 * const key = Key.fromP256({
 *   privateKey: P256.randomPrivateKey(),
 *   role: 'admin',
 * })
 *
 * // Session Key
 * const key = Key.fromP256({
 *   expiry: 1714857600,
 *   privateKey: P256.randomPrivateKey(),
 *   role: 'session',
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns P256 key.
 */
export function fromP256(parameters) {
  const { privateKey } = parameters
  const publicKey = PublicKey.toHex(P256.getPublicKey({ privateKey }), {
    includePrefix: false,
  })
  return from({
    canSign: true,
    expiry: parameters.expiry ?? 0,
    publicKey,
    role: parameters.role,
    permissions: parameters.permissions,
    privateKey() {
      return privateKey
    },
    type: 'p256',
  })
}
/**
 * Instantiates a key from its RPC format.
 *
 * @param rpc - RPC key.
 * @returns Key.
 */
export function fromRpc(rpc) {
  const permissions = rpc.permissions
    ? {
        calls: rpc.permissions.calls,
        spend: rpc.permissions.spend?.map((spend) => ({
          ...spend,
          limit: BigInt(spend.limit ?? 0),
        })),
      }
    : undefined
  return {
    canSign: false,
    expiry: rpc.expiry,
    publicKey: rpc.publicKey,
    role: rpc.role,
    type: rpc.type === 'contract' ? 'secp256k1' : rpc.type,
    ...(permissions ? { permissions } : {}),
  }
}
/**
 * Instantiates a Secp256k1 key from its parameters.
 *
 * @example
 * ```ts
 * import { Secp256k1 } from 'ox'
 * import * as Key from './key.js'
 *
 * // Admin Key
 * const key = Key.fromSecp256k1({
 *   privateKey: Secp256k1.randomPrivateKey(),
 *   role: 'admin',
 * })
 *
 * // Session Key
 * const key = Key.fromSecp256k1({
 *   expiry: 1714857600,
 *   privateKey: Secp256k1.randomPrivateKey(),
 *   role: 'session',
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns Secp256k1 key.
 */
export function fromSecp256k1(parameters) {
  const { privateKey, role } = parameters
  const address = (() => {
    if (parameters.address) return parameters.address.toLowerCase()
    const publicKey =
      parameters.publicKey ?? Secp256k1.getPublicKey({ privateKey: privateKey })
    return Address.fromPublicKey(publicKey)
  })()
  const publicKey = AbiParameters.encode([{ type: 'address' }], [address])
  return from({
    canSign: Boolean(privateKey),
    expiry: parameters.expiry ?? 0,
    publicKey,
    role,
    permissions: parameters.permissions,
    privateKey: privateKey ? () => privateKey : undefined,
    type: 'secp256k1',
  })
}
/**
 * Instantiates a WebAuthnP256 key from its parameters.
 *
 * @example
 * ```ts
 * import { WebAuthnP256 } from 'ox'
 * import * as Key from './key.js'
 *
 * const credential = await WebAuthnP256.createCredential({ name: 'My Key' })
 *
 * // Admin Key
 * const key = Key.fromWebAuthnP256({
 *   credential,
 *   role: 'admin',
 * })
 *
 * // Session Key
 * const key = Key.fromWebAuthnP256({
 *   expiry: 1714857600,
 *   credential,
 *   role: 'session',
 * })
 * ```
 *
 * @param parameters - Key parameters.
 * @returns WebAuthnP256 key.
 */
export function fromWebAuthnP256(parameters) {
  const { credential, rpId } = parameters
  const publicKey = PublicKey.toHex(credential.publicKey, {
    includePrefix: false,
  })
  return from({
    canSign: true,
    credential,
    expiry: parameters.expiry ?? 0,
    permissions: parameters.permissions,
    publicKey,
    role: parameters.role,
    rpId,
    type: 'webauthn-p256',
  })
}
/**
 * Hashes a key.
 *
 * @example
 * ```ts
 * import * as Key from './key.js'
 *
 * const key = Key.createP256({
 *   role: 'admin',
 * })
 *
 * const hash = Key.hash(key)
 * ```
 *
 * @param key - Key.
 * @returns Hashed key.
 */
export function hash(key) {
  const { publicKey, type } = key
  return Hash.keccak256(
    AbiParameters.encode(
      [{ type: 'uint8' }, { type: 'bytes32' }],
      [toSerializedKeyType[type], Hash.keccak256(publicKey)],
    ),
  )
}
/**
 * Serializes a key to a contract-compatible format.
 *
 * @example
 * ```ts
 * import * as Key from './key.js'
 *
 * const key = Key.createP256({
 *   role: 'admin',
 * })
 *
 * const serialized = Key.serialize(key)
 * ```
 *
 * @param key - Key.
 * @returns Serialized key.
 */
export function serialize(key) {
  const { expiry = 0, publicKey, role, type } = key
  return {
    expiry,
    isSuperAdmin: role === 'admin',
    keyType: toSerializedKeyType[type],
    publicKey,
  }
}
export async function sign(key, parameters) {
  const { address, payload } = parameters
  const { canSign, publicKey, type: keyType } = key
  if (!canSign)
    throw new Error(
      'Key is not canSign.\n\nKey:\n' + Json.stringify(key, null, 2),
    )
  const [signature, prehash] = await (async () => {
    if (keyType === 'p256') {
      const { privateKey } = key
      if (typeof privateKey === 'function')
        return [
          Signature.toHex(P256.sign({ payload, privateKey: privateKey() })),
          false,
        ]
      const signature = Signature.toHex(await P256Module.sign({ payload, key }))
      return [signature, true]
    }
    if (keyType === 'secp256k1') {
      const { privateKey } = key
      return [
        Signature.toHex(Secp256k1.sign({ payload, privateKey: privateKey() })),
        false,
      ]
    }
    if (keyType === 'webauthn-p256') {
      const { credential, rpId } = key
      const {
        signature: { r, s },
        raw,
        metadata,
      } = await WebAuthNModule.sign({
        challenge: payload,
        credentialId: credential.id,
        rpId,
      })
      const response = raw.response
      const userHandle = Bytes.toHex(new Uint8Array(response.userHandle))
      if (address !== userHandle)
        throw new Error(
          `supplied address "${address}" does not match signature address "${userHandle}"`,
        )
      const signature = AbiParameters.encode(
        AbiParameters.from([
          'struct WebAuthnAuth { bytes authenticatorData; string clientDataJSON; uint256 challengeIndex; uint256 typeIndex; bytes32 r; bytes32 s; }',
          'WebAuthnAuth auth',
        ]),
        [
          {
            authenticatorData: metadata.authenticatorData,
            challengeIndex: BigInt(metadata.challengeIndex),
            clientDataJSON: metadata.clientDataJSON,
            r: Hex.fromNumber(r, { size: 32 }),
            s: Hex.fromNumber(s, { size: 32 }),
            typeIndex: BigInt(metadata.typeIndex),
          },
        ],
      )
      return [signature, false]
    }
    throw new Error(
      `Key type "${keyType}" is not supported.\n\nKey:\n` +
        Json.stringify(key, null, 2),
    )
  })()
  return wrapSignature(signature, {
    keyType,
    publicKey,
    prehash,
  })
}
/**
 * Converts a key into RPC format.
 *
 * @param key - Key.
 * @returns RPC key.
 */
export function toRpc(key) {
  const permissions = key.permissions
    ? {
        ...key.permissions,
        spend: key.permissions.spend?.map((spend) => ({
          ...spend,
          limit: Hex.fromNumber(spend.limit),
        })),
      }
    : undefined
  return {
    expiry: key.expiry,
    publicKey: key.publicKey,
    role: key.role,
    type: key.type,
    ...(permissions ? { permissions } : {}),
  }
}
///////////////////////////////////////////////////////////////////////////
// Internal
///////////////////////////////////////////////////////////////////////////
function wrapSignature(signature, options) {
  const { keyType: type, prehash = false, publicKey } = options
  const keyHash = hash({ publicKey, type })
  return AbiParameters.encodePacked(
    ['bytes', 'bytes32', 'bool'],
    [signature, keyHash, prehash],
  )
}
