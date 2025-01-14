import { type AuthenticatorTransportType, WebAuthnError } from './types'
import { base64URLToArrayBuffer, bufferSourceToBase64 } from './utils'
import type {
  AuthenticatorAssertionResponse,
  AuthenticatorTransport,
  CredentialRequestOptions as WebAuthnCredentialRequestOptions,
  PublicKeyCredential,
  PublicKeyCredentialDescriptor,
  UserVerificationRequirement,
} from './webauthn'

// ============= Types =============

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

// ============= Errors =============

/** Base class for assertion errors */
class AssertionError extends WebAuthnError {}

/** Thrown when request options are invalid */
class InvalidOptionsError extends AssertionError {}

/** Thrown when a required field is missing */
class MissingFieldError extends AssertionError {
  constructor(field: string) {
    super(`Missing required field: ${field}`)
  }
}

/** Thrown when assertion parsing fails */
class ParseError extends AssertionError {
  constructor({ cause }: { cause?: Error } = {}) {
    super('Failed to parse assertion response.', { cause })
  }
}

// ============= Validation Functions =============

/**
 * Validates required fields in request options
 * @throws {MissingFieldError} When a required field is missing
 * @internal
 */
function validateOptions(options: {
  challenge: BufferSource | undefined
  rpId: string | undefined
}): void {
  if (!options.challenge) {
    throw new MissingFieldError('challenge')
  }
  if (options.rpId === undefined) {
    throw new MissingFieldError('rpId')
  }
}

// ============= Conversion Functions =============

/**
 * Maps a WebAuthn transport to an iOS authenticator transport
 * @see https://developer.apple.com/documentation/authenticationservices/asauthorizationsecuritykeypublickeycredentialdescriptor/transport
 * @internal
 */
function mapAuthenticatorTransport(
  transport: AuthenticatorTransport,
): AuthenticatorTransportType | undefined {
  switch (transport) {
    case 'usb':
    case 'nfc':
    case 'ble':
    case 'hybrid':
      return transport
    case 'internal':
      return undefined
  }
}

/**
 * Creates credential descriptor in iOS format
 * @internal
 */
function createDescriptor(descriptor: PublicKeyCredentialDescriptor): {
  type: 'public-key'
  id: string
  transports?: AuthenticatorTransportType[]
} {
  return {
    type: 'public-key',
    id: bufferSourceToBase64(descriptor.id),
    transports: descriptor.transports
      ?.map(mapAuthenticatorTransport)
      .filter((t): t is AuthenticatorTransportType => t !== undefined),
  }
}

/**
 * Creates assertion options in iOS format
 * @throws {InvalidOptionsError} When required fields are missing
 * @internal
 */
export function create(options: create.Options): create.ReturnType {
  const publicKey = options.publicKey
  if (!publicKey) throw new InvalidOptionsError('Missing publicKey')

  validateOptions({
    challenge: publicKey.challenge,
    rpId: publicKey.rpId,
  })

  return {
    challenge: bufferSourceToBase64(publicKey.challenge),
    rpId: publicKey.rpId || '',
    allowCredentials: publicKey.allowCredentials?.map(createDescriptor),
    userVerification: publicKey.userVerification,
    timeout: publicKey.timeout,
  }
}

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
export function parse(response: parse.Input): parse.ReturnType {
  try {
    return {
      id: response.id,
      rawId: base64URLToArrayBuffer(response.rawId),
      response: {
        authenticatorData: base64URLToArrayBuffer(
          response.response.authenticatorData,
        ),
        clientDataJSON: base64URLToArrayBuffer(
          response.response.clientDataJSON,
        ),
        signature: base64URLToArrayBuffer(response.response.signature),
        userHandle: response.response.userHandle
          ? base64URLToArrayBuffer(response.response.userHandle)
          : null,
      },
      type: 'public-key',
      authenticatorAttachment: response.authenticatorAttachment || null,
      getClientExtensionResults: () => ({}),
    }
  } catch (error) {
    throw new ParseError({ cause: error as Error })
  }
}

export declare namespace parse {
  type Input = AssertionResponse
  type ReturnType = PublicKeyCredential & {
    response: AuthenticatorAssertionResponse
  }
  type ErrorType = ParseError
}
