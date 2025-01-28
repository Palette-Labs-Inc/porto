import { Errors } from 'ox'
import ExpoWebAuthN from './ExpoWebAuthN'
import * as assertion from './internal/assertion'
import * as credential from './internal/credential'
import type * as internal from './internal/webauthn'

// ============= Functions =============

/**
 * Creates a new WebAuthn credential for the specified options.
 *
 * On iOS, this uses ASAuthorizationPlatformPublicKeyCredentialProvider for credential creation.
 * The private key is stored securely in the device's keychain, and a reference is maintained
 * for future operations.
 *
 * Note: While this function accepts WebAuthn credential creation options, it is specifically
 * designed to work with the native module implementation. The options are converted into
 * the appropriate format for each platform:
 * - iOS: Uses ASAuthorizationPlatformPublicKeyCredentialProvider
 * - Android: Uses the FIDO2 API (API Level 28+)
 *
 * @example
 * ```ts
 * const credential = await WebAuthN.createCredential({
 *   publicKey: {
 *     rp: { id: 'example.com', name: 'Example' },
 *     user: { id: new Uint8Array([1,2,3]), name: 'user', displayName: 'User' },
 *     challenge: new Uint8Array([1,2,3])
 *   }
 * })
 * ```
 *
 * This function can also be used as a custom createFn with WebAuthnP256:
 * ```ts
 * import { WebAuthnP256 } from 'ox'
 *
 * const credential = await WebAuthnP256.createCredential({
 *   name: 'Example',
 *   createFn: Platform.OS !== 'web'
 *     ? (options) => WebAuthN.createCredential(options)
 *     : undefined
 * })
 * ```
 *
 * @param options - The credential creation options
 * @returns A Promise that resolves with the created credential
 */
export async function createCredential(
  options: createCredential.Parameters,
): Promise<createCredential.ReturnType> {
  if (!options) {
    throw new MissingOptionsError('Credential creation')
  }
  const nativeOptions = credential.createNativeCredential(options)
  console.info('[WebAuthN: createCredential] nativeOptions', nativeOptions)
  const nativeResponse = await ExpoWebAuthN.createCredential(nativeOptions)
  console.info(
    '[WebAuthN: createCredential] nativeResponse',
    credential.fromNativeAttestation(nativeResponse),
  )
  return credential.fromNativeAttestation(nativeResponse)
}

export declare namespace createCredential {
  type Parameters = internal.CredentialCreationOptions | undefined
  type ReturnType = internal.PublicKeyCredential & {
    response: internal.AuthenticatorAttestationResponse
  }
  type ErrorType =
    | MissingOptionsError
    | credential.InvalidOptionsError
    | credential.MissingFieldError
    | credential.ParseError
    | credential.PublicKeyExtractionError
}

/**
 * Gets an existing WebAuthn credential using the specified options.
 *
 * On iOS, this uses ASAuthorizationPlatformPublicKeyCredentialProvider for credential assertion.
 * It will access the previously stored credential in the device's keychain using the provided
 * parameters.
 *
 * Note: While this function accepts WebAuthn credential request options, it is specifically
 * designed to work with the native module implementation. The options are converted into
 * the appropriate format for each platform:
 * - iOS: Uses ASAuthorizationPlatformPublicKeyCredentialProvider
 * - Android: Uses the FIDO2 API (API Level 28+)
 *
 * @example
 * ```ts
 * const assertion = await WebAuthN.getCredential({
 *   publicKey: {
 *     challenge: new Uint8Array([1,2,3]),
 *     rpId: 'example.com',
 *     allowCredentials: [{
 *       id: new Uint8Array([4,5,6]),
 *       type: 'public-key'
 *     }]
 *   }
 * })
 * ```
 *
 * This function can also be used as a custom getFn with WebAuthnP256:
 * ```ts
 * import { WebAuthnP256 } from 'ox'
 *
 * const { metadata, signature } = await WebAuthnP256.sign({
 *   challenge: '0xdeadbeef',
 *   getFn: Platform.OS !== 'web'
 *     ? (options) => WebAuthN.getCredential(options)
 *     : undefined
 * })
 * ```
 *
 * @param options - The credential request options
 * @returns A Promise that resolves with the credential assertion
 */
export async function getCredential(
  options: getCredential.Parameters,
): Promise<getCredential.ReturnType> {
  if (!options) {
    throw new MissingOptionsError('Credential request')
  }

  const nativeOptions = assertion.createNativeAssertion(options)
  console.info('[WebAuthN: getCredential] nativeOptions', nativeOptions)
  const nativeResponse = await ExpoWebAuthN.getCredential(nativeOptions)
  console.info(
    '[WebAuthN: getCredential] nativeResponse',
    assertion.fromNativeAssertion(nativeResponse),
  )
  return assertion.fromNativeAssertion(nativeResponse)
}

export declare namespace getCredential {
  type Parameters = internal.CredentialRequestOptions | undefined
  type ReturnType = internal.PublicKeyCredential & {
    response: internal.AuthenticatorAssertionResponse
  }
  type ErrorType =
    | MissingOptionsError
    | assertion.InvalidOptionsError
    | assertion.MissingFieldError
    | assertion.ParseError
}

// ============= Errors =============

/** Thrown when required options are missing */
export class MissingOptionsError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'WebAuthN.MissingOptionsError' as const
  constructor(operation: string) {
    super(`${operation} options are required`)
  }
}
