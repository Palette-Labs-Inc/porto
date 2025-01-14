import { WebAuthnError } from './types'
import { base64URLToArrayBuffer, bufferSourceToBase64 } from './utils'
// ============= Errors =============
/** Base class for assertion errors */
class AssertionError extends WebAuthnError {}
/** Thrown when request options are invalid */
class InvalidOptionsError extends AssertionError {}
/** Thrown when a required field is missing */
class MissingFieldError extends AssertionError {
  constructor(field) {
    super(`Missing required field: ${field}`)
  }
}
/** Thrown when assertion parsing fails */
class ParseError extends AssertionError {
  constructor({ cause } = {}) {
    super('Failed to parse assertion response.', { cause })
  }
}
// ============= Validation Functions =============
/**
 * Validates required fields in request options
 * @throws {MissingFieldError} When a required field is missing
 * @internal
 */
function validateOptions(options) {
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
function mapAuthenticatorTransport(transport) {
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
function createDescriptor(descriptor) {
  return {
    type: 'public-key',
    id: bufferSourceToBase64(descriptor.id),
    transports: descriptor.transports
      ?.map(mapAuthenticatorTransport)
      .filter((t) => t !== undefined),
  }
}
/**
 * Creates assertion options in iOS format
 * @throws {InvalidOptionsError} When required fields are missing
 * @internal
 */
export function create(options) {
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
export function parse(response) {
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
    throw new ParseError({ cause: error })
  }
}
//# sourceMappingURL=assertion.js.map
