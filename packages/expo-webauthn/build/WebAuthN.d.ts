import type * as assertion from './internal/assertion'
import type * as credential from './internal/credential'
import { WebAuthnError } from './internal/types'
import type {
  AuthenticatorAssertionResponse,
  AuthenticatorAttestationResponse,
  PublicKeyCredential,
  CredentialCreationOptions as WebAuthnCredentialCreationOptions,
  CredentialRequestOptions as WebAuthnCredentialRequestOptions,
} from './internal/webauthn'
declare class WebAuthNError extends WebAuthnError {}
/** Thrown when WebAuthn is not supported on the device */
declare class UnsupportedError extends WebAuthNError {
  readonly name = 'WebAuthN.UnsupportedError'
  constructor()
}
/** Thrown when required options are missing */
declare class MissingOptionsError extends WebAuthNError {
  readonly name = 'WebAuthN.MissingOptionsError'
  constructor(operation: string)
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
export declare function isSupported(): boolean
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
export declare function createCredential(
  options: createCredential.Options,
): Promise<createCredential.ReturnType>
export declare namespace createCredential {
  type Options = WebAuthnCredentialCreationOptions | undefined
  type ReturnType = PublicKeyCredential & {
    response: AuthenticatorAttestationResponse
  }
  type ErrorType =
    | MissingOptionsError
    | UnsupportedError
    | credential.create.ErrorType
    | credential.parse.ErrorType
    | credential.parseSPKIFromAttestation.ErrorType
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
export declare function getCredential(
  options: getCredential.Options,
): Promise<getCredential.ReturnType>
export declare namespace getCredential {
  type Options = WebAuthnCredentialRequestOptions | undefined
  type ReturnType = PublicKeyCredential & {
    response: AuthenticatorAssertionResponse
  }
  type ErrorType =
    | MissingOptionsError
    | UnsupportedError
    | assertion.create.ErrorType
    | assertion.parse.ErrorType
}
//# sourceMappingURL=WebAuthN.d.ts.map
