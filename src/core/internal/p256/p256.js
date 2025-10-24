import { PublicKey } from 'ox';
import * as WebCryptoP256 from 'ox/WebCryptoP256';
import { from } from '../key.js';
export const createKeyPair = async (parameters) => {
    const keyPair = await WebCryptoP256.createKeyPair();
    return fromWebCryptoP256({
        ...parameters,
        keyPair,
    });
};
export const sign = async (options) => {
    const { privateKey } = options.key;
    if (privateKey instanceof CryptoKey) {
        return WebCryptoP256.sign({
            payload: options.payload,
            privateKey: privateKey,
        });
    }
    throw new Error('Private key is not a CryptoKey, the porto package is either not properly resolving native vs. web file paths or your choice of storage is not storing the private key material as a CryptoKey.');
};
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
export function fromWebCryptoP256(parameters) {
    const { keyPair } = parameters;
    const { privateKey } = keyPair;
    const publicKey = PublicKey.toHex(keyPair.publicKey, {
        includePrefix: false,
    });
    return from({
        canSign: true,
        expiry: parameters.expiry ?? 0,
        permissions: parameters.permissions,
        publicKey,
        role: parameters.role,
        privateKey,
        type: 'p256',
    });
}
