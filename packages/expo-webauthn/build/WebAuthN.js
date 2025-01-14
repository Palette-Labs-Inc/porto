import { Platform } from 'react-native';
import ExpoWebAuthN from './ExpoWebAuthN';
import * as assertion from './internal/assertion';
import * as credential from './internal/credential';
import { logger } from './internal/logger';
import { WebAuthnError } from './internal/types';
import { bufferSourceToBase64 } from './internal/utils';
// ============= Errors =============
class WebAuthNError extends WebAuthnError {
}
/** Thrown when WebAuthn is not supported on the device */
class UnsupportedError extends WebAuthNError {
    name = 'WebAuthN.UnsupportedError';
    constructor() {
        super('WebAuthn is not supported on this device');
    }
}
/** Thrown when required options are missing */
class MissingOptionsError extends WebAuthNError {
    name = 'WebAuthN.MissingOptionsError';
    constructor(operation) {
        super(`${operation} options are required`);
    }
}
/**
 * Checks if WebAuthn is supported on the current device.
 *
 * Platform requirements:
 * - iOS: iOS 15 or later (uses ASAuthorizationPlatformPublicKeyCredentialProvider)
 * - Android: API Level 28 or later
 *
 * @returns boolean indicating whether WebAuthn is supported
 */
export function isSupported() {
    if (Platform.OS === 'android') {
        return Platform.Version >= 28;
    }
    if (Platform.OS === 'ios') {
        return Number.parseInt(Platform.Version, 10) >= 15;
    }
    return false;
}
/**
 * Creates a new WebAuthn credential for the specified options.
 * This function is designed to be used with WebAuthnP256.createCredential as a custom createFn.
 *
 * On iOS, this uses ASAuthorizationPlatformPublicKeyCredentialProvider for credential creation.
 *
 * Note: While this function accepts undefined options to match WebAuthnP256.ts's type signature,
 * passing undefined will result in an error. This is because the underlying WebAuthn API
 * requires valid credential creation options. The only reason undefined is accepted in the type
 * signature is to maintain compatibility with WebAuthnP256.ts's createFn type.
 *
 * @example
 * ```ts
 * import { WebAuthnP256 } from 'ox'
 * import * as ExpoWebAuthN from '@porto/expo-webauthn'
 *
 * // Use as custom createFn in WebAuthnP256
 * const credential = await WebAuthnP256.createCredential({
 *   name: 'Example',
 *   createFn: Platform.OS !== 'web'
 *     ? (options) => ExpoWebAuthN.createCredential(options)
 *     : undefined
 * })
 * ```
 *
 * @param options - The credential creation options
 * @returns A Promise that resolves with the created credential
 * @throws {MissingOptionsError} When options is undefined
 */
export async function createCredential(options) {
    logger.debug('[WebAuthN:createCredential] Starting credential creation:', {
        hasOptions: !!options,
        hasPublicKey: !!options?.publicKey,
        rpId: options?.publicKey?.rp?.id,
    });
    if (!options) {
        logger.error('[WebAuthN:createCredential] No options provided');
        throw new MissingOptionsError('Credential creation');
    }
    if (!isSupported()) {
        throw new UnsupportedError();
    }
    logger.debug('[WebAuthN:createCredential] Creating native options');
    const nativeOptions = credential.create(options);
    logger.debug('[WebAuthN:createCredential] Native options created:', {
        hasRp: !!nativeOptions.publicKey?.rp,
        rpId: nativeOptions.publicKey?.rp
            ?.id,
        hasUser: !!nativeOptions.publicKey
            ?.user,
        authenticatorSelection: nativeOptions
            .publicKey?.authenticatorSelection,
        timeout: nativeOptions.publicKey
            ?.timeout,
    });
    logger.debug('[WebAuthN:createCredential] Calling native createCredential');
    const nativeResponse = await ExpoWebAuthN.createCredential(nativeOptions);
    logger.debug('[WebAuthN:createCredential] Native createCredential returned:', {
        success: !!nativeResponse,
        type: nativeResponse?.type,
        hasId: !!nativeResponse?.id,
        hasResponse: !!nativeResponse?.response,
    });
    // TODO: add zod validation or something here.
    const nativeCredential = nativeResponse;
    logger.debug('[WebAuthN:createCredential] Credential parsed:', {
        type: nativeCredential.type,
        hasResponse: !!nativeCredential.response,
        hasAttestationObject: !!nativeCredential.response.attestationObject,
        hasClientData: !!nativeCredential.response.clientDataJSON,
    });
    return credential.parse(nativeResponse);
}
/**
 * Gets an existing WebAuthn credential using the specified options.
 * This function is designed to be used with WebAuthnP256.sign as a custom getFn.
 *
 * On iOS, this uses ASAuthorizationPlatformPublicKeyCredentialProvider for credential assertion.
 *
 * Note: While this function accepts undefined options to match WebAuthnP256.ts's type signature,
 * passing undefined will result in an error. This is because the underlying WebAuthn API
 * requires valid credential request options. The only reason undefined is accepted in the type
 * signature is to maintain compatibility with WebAuthnP256.ts's getFn type.
 *
 * @example
 * ```ts
 * import { WebAuthnP256 } from 'ox'
 * import * as ExpoWebAuthN from '@porto/expo-webauthn'
 *
 * // Use as custom getFn in WebAuthnP256
 * const { metadata, signature } = await WebAuthnP256.sign({
 *   challenge: '0xdeadbeef',
 *   getFn: Platform.OS !== 'web'
 *     ? (options) => ExpoWebAuthN.getCredential(options)
 *     : undefined
 * })
 * ```
 *
 * @param options - The credential request options
 * @returns A Promise that resolves with the credential assertion
 * @throws {UnsupportedError} When WebAuthn is not supported on the device
 * @throws {MissingOptionsError} When options is undefined
 */
export async function getCredential(options) {
    if (!isSupported()) {
        throw new UnsupportedError();
    }
    if (!options) {
        logger.error('[WebAuthN:getCredential] No options provided');
        throw new MissingOptionsError('Credential request');
    }
    logger.debug('Getting credential with options:', {
        options,
        publicKey: options.publicKey,
        challenge: options.publicKey?.challenge &&
            bufferSourceToBase64(options.publicKey.challenge),
        rpId: options.publicKey?.rpId,
        allowCredentials: options.publicKey?.allowCredentials?.map((cred) => ({
            id: bufferSourceToBase64(cred.id),
            type: cred.type,
            transports: cred.transports,
        })),
        userVerification: options.publicKey?.userVerification,
        timeout: options.publicKey?.timeout,
    });
    const nativeOptions = assertion.create(options);
    // TODO: add zod validation or something here.
    const nativeResponse = (await ExpoWebAuthN.getCredential(nativeOptions));
    logger.debug('Received native response:', {
        response: nativeResponse,
        responseType: typeof nativeResponse,
        hasAuthenticatorData: 'authenticatorData' in nativeResponse.response,
        hasClientDataJSON: 'clientDataJSON' in nativeResponse.response,
        hasSignature: 'signature' in nativeResponse.response,
    });
    return assertion.parse(nativeResponse);
}
//# sourceMappingURL=WebAuthN.js.map