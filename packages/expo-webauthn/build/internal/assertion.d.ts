import { type AuthenticatorTransportType, WebAuthnError } from './types'
import type {
  AuthenticatorAssertionResponse,
  PublicKeyCredential,
  UserVerificationRequirement,
  CredentialRequestOptions as WebAuthnCredentialRequestOptions,
} from './webauthn'
/**
 * Options for requesting an existing credential
 * @internal
 */
interface AssertionOptions {
  challenge: string
  rpId: string
  allowCredentials?: {
    type?: 'public-key'
    id: string
    transports?: AuthenticatorTransportType[]
  }[]
  userVerification?: UserVerificationRequirement
  timeout?: number
}
/**
 * Response from a successful credential assertion
 * @internal
 */
interface AssertionResponse {
  id: string
  rawId: string
  response: {
    authenticatorData: string
    clientDataJSON: string
    signature: string
    userHandle?: string
  }
  type: 'public-key'
  authenticatorAttachment?: string
}
/** Base class for assertion errors */
declare class AssertionError extends WebAuthnError {}
/** Thrown when request options are invalid */
declare class InvalidOptionsError extends AssertionError {}
/** Thrown when a required field is missing */
declare class MissingFieldError extends AssertionError {
  constructor(field: string)
}
/** Thrown when assertion parsing fails */
declare class ParseError extends AssertionError {
  constructor({
    cause,
  }?: {
    cause?: Error
  })
}
/**
 * Creates assertion options in iOS format
 * @throws {InvalidOptionsError} When required fields are missing
 * @internal
 */
export declare function create(options: create.Options): create.ReturnType
export declare namespace create {
  type Options = WebAuthnCredentialRequestOptions
  type ReturnType = AssertionOptions
  type ErrorType = InvalidOptionsError | MissingFieldError | Error
}
/**
 * Parses a native iOS assertion response into WebAuthn format
 *
 * @example
 * ```ts
 * const assertion = assertion.parse(nativeResponse)
 * // Returns WebAuthn formatted assertion
 * ```
 *
 * @param response - Native iOS assertion response
 * @returns WebAuthn formatted assertion
 * @throws {ParseError} If assertion cannot be parsed
 */
export declare function parse(response: parse.Input): parse.ReturnType
export declare namespace parse {
  type Input = AssertionResponse
  type ReturnType = PublicKeyCredential & {
    response: AuthenticatorAssertionResponse
  }
  type ErrorType = ParseError
}
//# sourceMappingURL=assertion.d.ts.map
