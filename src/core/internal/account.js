import * as Address from 'ox/Address';
import * as Secp256k1 from 'ox/Secp256k1';
import * as Signature from 'ox/Signature';
import * as Key from './key.js';
/**
 * Instantiates a delegated account.
 *
 * @param account - Account to instantiate.
 * @returns An instantiated delegated account.
 */
export function from(parameters) {
    const account = (typeof parameters === 'string' ? { address: parameters } : parameters);
    return { ...account, type: 'delegated' };
}
/**
 * Instantiates a delegated account from a private key.
 *
 * @param privateKey - Private key.
 * @param options - Options.
 * @returns An instantiated delegated account.
 */
export function fromPrivateKey(privateKey, options = {}) {
    const { keys } = options;
    const address = Address.fromPublicKey(Secp256k1.getPublicKey({ privateKey }));
    return from({
        address,
        keys,
        async sign({ payload }) {
            return Signature.toHex(Secp256k1.sign({
                privateKey,
                payload,
            }));
        },
    });
}
/**
 * Extracts a signing key from a delegated account and signs payload(s).
 *
 * @example
 * TODO
 *
 * @param parameters - Parameters.
 * @returns Signatures.
 */
export async function sign(account, parameters) {
    const { payloads } = parameters;
    const [payload, authorizationPayload] = payloads;
    // If we have an authorization payload, but no root signing key on the account,
    // then we cannot perform an authorization as we need the EOA's private key.
    if (authorizationPayload && !account.sign)
        throw new Error('cannot find root signing key to sign authorization.');
    // Extract a key to sign the payload with.
    const key = (() => {
        const key = parameters.key;
        // Extract from `key` parameter.
        if (typeof key === 'object')
            return key;
        // If we have an authorization payload, use the root signing key.
        if (authorizationPayload)
            return undefined;
        // Extract from `account.keys` (with optional `key` index).
        if (account.keys && account.keys.length > 0) {
            if (typeof key === 'number')
                return account.keys[key];
            return account.keys.find((key) => key.canSign);
        }
        return undefined;
    })();
    const sign = (() => {
        // If we have no key, use the root signing key.
        if (!key)
            return account.sign;
        return (parameters) => Key.sign(key, {
            ...parameters,
            address: account.address,
        });
    })();
    // If the account has no valid signing key, then we cannot sign the payload.
    if (!sign)
        throw new Error('cannot find key to sign with.');
    // Sign the payload(s).
    const signatures = await Promise.all([
        sign({ payload }),
        authorizationPayload && account.sign
            ? account.sign({ payload: authorizationPayload })
            : undefined,
    ]);
    return signatures;
}
