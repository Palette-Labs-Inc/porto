import { Errors } from 'ox'
import { base64URLToArrayBuffer, bufferSourceToBase64 } from './utils'
import type * as internal from './webauthn'

// ============= Validation Functions =============

/**
 * Validates required fields in request options
 * @internal
 */
function validateOptions(options: {
  challenge: internal.BufferSource | undefined
  rpId: string | undefined
}): void {
  if (!options.challenge) {
    throw new MissingFieldError('challenge')
  }

  if (options.rpId === undefined) {
    throw new MissingFieldError('rpId')
  }
}

/**
 * Maps a WebAuthn transport to an iOS authenticator transport
 * @see https://developer.apple.com/documentation/authenticationservices/asauthorizationsecuritykeypublickeycredentialdescriptor/transport
 * @internal
 */
function mapAuthenticatorTransport(
  transport: internal.AuthenticatorTransport,
): internal.AuthenticatorTransportType | undefined {
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
function createDescriptor(descriptor: internal.PublicKeyCredentialDescriptor): {
  type: 'public-key'
  id: string
  transports?: internal.AuthenticatorTransportType[]
} {
  return {
    type: 'public-key',
    id: bufferSourceToBase64(descriptor.id),
    transports: descriptor.transports
      ?.map(mapAuthenticatorTransport)
      .filter((t): t is internal.AuthenticatorTransportType => t !== undefined),
  }
}

/**
 * Creates native module assertion options from WebAuthn options.
 * This converts WebAuthn credential request options into the format expected by the native module.
 *
 * @example
 * ```ts
 * const nativeOptions = createNativeAssertion({
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
 * @param options - WebAuthn credential request options
 * @returns Native module assertion options
 */
export function createNativeAssertion(
  options: createNativeAssertion.Parameters,
): createNativeAssertion.ReturnType {
  try {
    const publicKey = options.publicKey
    if (!publicKey) {
      throw new InvalidOptionsError('Missing publicKey')
    }

    console.info(
      '[WebAuthN: createNativeAssertion] publicKey challenge',
      bufferSourceToBase64(publicKey.challenge),
    )

    // TODO: Better type assertion, shouldn't have to cast rpId to empty string.
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
  } catch (error) {
    if (
      error instanceof InvalidOptionsError ||
      error instanceof MissingFieldError
    ) {
      throw error
    }
    throw new InvalidOptionsError('Failed to create assertion options', {
      cause: error as Error,
    })
  }
}

export declare namespace createNativeAssertion {
  type Parameters = internal.CredentialRequestOptions

  /**
   * Native module assertion format.
   * This is the format expected by the native module for credential requests.
   */
  type ReturnType = {
    challenge: string
    rpId: string
    allowCredentials?: {
      type?: 'public-key'
      id: string
      transports?: internal.AuthenticatorTransportType[]
    }[]
    userVerification?: internal.UserVerificationRequirement
    timeout?: number
  }

  type ErrorType = InvalidOptionsError | MissingFieldError | Error
}

/**
 * Parses a native module assertion response into WebAuthn format.
 * This converts the native module's response into the standard WebAuthn assertion format.
 *
 * @example
 * ```ts
 * const assertion = fromNativeAssertion(nativeResponse)
 * // Returns WebAuthn formatted assertion response
 * ```
 *
 * @param response - Native module assertion response
 * @returns WebAuthn formatted assertion
 */
export function fromNativeAssertion(
  response: fromNativeAssertion.Parameters,
): fromNativeAssertion.ReturnType {
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

export declare namespace fromNativeAssertion {
  /**
   * Native module assertion response format.
   * This is the format returned by the native module after credential request.
   */
  type Parameters = {
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

  type ReturnType = internal.PublicKeyCredential & {
    response: internal.AuthenticatorAssertionResponse
  }

  type ErrorType = ParseError
}

// ============= Errors =============

/** Thrown when assertion request options are invalid */
export class InvalidOptionsError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'WebAuthN.InvalidOptionsError' as const
  constructor(message: string, options: { cause?: Error } = {}) {
    super(message, options)
  }
}

/** Thrown when a required field is missing */
export class MissingFieldError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'WebAuthN.MissingFieldError' as const
  constructor(field: string) {
    super(`Missing required field: ${field}`)
  }
}

/** Thrown when assertion parsing fails */
export class ParseError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'WebAuthN.ParseError' as const
  constructor(options: { cause?: Error } = {}) {
    super('Failed to parse assertion response.', options)
  }
}
