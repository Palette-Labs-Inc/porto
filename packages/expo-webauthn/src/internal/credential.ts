import {
  type AuthenticatorTransportType,
  type CredentialUserEntity,
  WebAuthnError,
} from './types'
import { base64URLToArrayBuffer, bufferSourceToBase64 } from './utils'
import type {
  AttestationConveyancePreference,
  AuthenticatorAttestationResponse,
  AuthenticatorSelectionCriteria,
  AuthenticatorTransport,
  PublicKeyCredential,
  PublicKeyCredentialDescriptor,
  PublicKeyCredentialParameters,
  PublicKeyCredentialRpEntity,
  CredentialCreationOptions as WebAuthnCredentialCreationOptions,
} from './webauthn'

// ============= Types =============

/**
 * Options for creating a new credential
 * @internal
 */
interface CredentialCreationOptions {
  rp: PublicKeyCredentialRpEntity
  user: CredentialUserEntity
  challenge: string
  pubKeyCredParams?: {
    type: 'public-key'
    alg: number
  }[]
  timeout?: number
  excludeCredentials?: {
    type?: 'public-key'
    id: string
    transports?: AuthenticatorTransportType[]
  }[]
  authenticatorSelection?: AuthenticatorSelectionCriteria
  attestation?: AttestationConveyancePreference
}

/**
 * Response from a successful credential creation
 * @internal
 */
interface CredentialAttestationResponse {
  id: string
  rawId: string
  response: {
    attestationObject: string
    clientDataJSON: string
  }
  type: 'public-key'
}

// ============= Errors =============

/** Base class for credential errors */
class CredentialError extends WebAuthnError {}

/** Thrown when creation options are invalid */
class InvalidOptionsError extends CredentialError {}

/** Thrown when a required field is missing */
class MissingFieldError extends CredentialError {
  constructor(field: string) {
    super(`Missing required field: ${field}`)
  }
}

/** Thrown when credential parsing fails */
class ParseError extends CredentialError {
  constructor({ cause }: { cause?: Error } = {}) {
    super('Failed to parse credential response.', { cause })
  }
}

/** Thrown when public key extraction fails */
class PublicKeyExtractionError extends CredentialError {
  constructor({ cause }: { cause?: Error } = {}) {
    super('Failed to extract public key from attestation object.', { cause })
  }
}

// ============= Functions =============

/**
 * Parses a SPKI (Subject Public Key Info) formatted public key from an attestation object.
 * The SPKI format is defined in RFC 5280 and is the standard format for X.509 certificates.
 *
 * @example
 * ```ts
 * const publicKeyBuffer = credential.parseSPKIFromAttestation(attestationObject)
 * ```
 *
 * @param attestationObject - Base64URL encoded attestation object
 * @returns ArrayBuffer containing the public key in SPKI format
 * @throws {PublicKeyExtractionError} If SPKI parsing fails
 */
export function parseSPKIFromAttestation(
  attestationObject: parseSPKIFromAttestation.Input,
): parseSPKIFromAttestation.ReturnType {
  try {
    // Decode attestation object
    const data = new Uint8Array(base64URLToArrayBuffer(attestationObject))
    const coordinateLength = 0x20 // 32 bytes for P-256
    const cborPrefix = 0x58

    // Find coordinate positions
    const findStart = (key: number): number | null => {
      const coordinate = new Uint8Array([key, cborPrefix, coordinateLength])
      for (let i = 0; i < data.length - coordinate.length; i++)
        if (coordinate.every((byte, j) => data[i + j] === byte))
          return i + coordinate.length
      return null
    }

    const xStart = findStart(0x21)
    const yStart = findStart(0x22)
    console.info('[parseSPKIFromAttestation]:xStart', xStart)
    console.info('[parseSPKIFromAttestation]:yStart', yStart)
    if (!xStart || !yStart) {
      throw new Error(
        'Could not find public key coordinates in attestation object',
      )
    }

    // SPKI format prefix for P-256 public key
    const spkiPrefix = new Uint8Array([
      0x30,
      0x59, // SEQUENCE, length 89
      0x30,
      0x13, // SEQUENCE, length 19
      0x06,
      0x07, // OBJECT IDENTIFIER, length 7
      0x2a,
      0x86,
      0x48,
      0xce,
      0x3d,
      0x02,
      0x01, // OID 1.2.840.10045.2.1 (ecPublicKey)
      0x06,
      0x08, // OBJECT IDENTIFIER, length 8
      0x2a,
      0x86,
      0x48,
      0xce,
      0x3d,
      0x03,
      0x01,
      0x07, // OID 1.2.840.10045.3.1.7 (prime256v1)
      0x03,
      0x42, // BIT STRING, length 66
      0x00, // No unused bits
      0x04, // Uncompressed point format
    ])

    // Combine into final public key format
    const publicKeyBytes = new Uint8Array(
      spkiPrefix.length + coordinateLength * 2,
    )
    publicKeyBytes.set(spkiPrefix)
    publicKeyBytes.set(
      data.slice(xStart, xStart + coordinateLength),
      spkiPrefix.length,
    )
    publicKeyBytes.set(
      data.slice(yStart, yStart + coordinateLength),
      spkiPrefix.length + coordinateLength,
    )

    return publicKeyBytes.buffer
  } catch (error) {
    throw new PublicKeyExtractionError({ cause: error as Error })
  }
}

export declare namespace parseSPKIFromAttestation {
  type Input = string
  type ReturnType = ArrayBuffer
  type ErrorType = PublicKeyExtractionError
}

// ============= Validation Functions =============

/**
 * Validates that the algorithm is supported
 * @throws {InvalidOptionsError} When algorithm is not ES256 (-7)
 * @internal
 */
function validateAlgorithm(alg: number): void {
  if (alg !== -7) {
    // ES256
    throw new InvalidOptionsError('Unsupported algorithm', {
      metaMessages: [
        'Only ES256 (-7) is supported by AuthenticationServices.',
        'See https://developer.apple.com/documentation/authenticationservices/ascosealgorithmidentifier',
      ],
    })
  }
}

/**
 * Validates required fields in creation options
 * @throws {MissingFieldError} When a required field is missing
 * @internal
 */
function validateOptions(options: {
  rp: PublicKeyCredentialRpEntity | undefined
  user: PublicKeyCredentialUserEntity | undefined
  challenge: BufferSource | undefined
}): void {
  if (!options.rp?.name) {
    throw new MissingFieldError('rp.name')
  }
  if (!options.user?.name) {
    throw new MissingFieldError('user.name')
  }
  if (!options.challenge) {
    throw new MissingFieldError('challenge')
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
 * Creates credential parameters in iOS format
 * @throws {InvalidOptionsError} When algorithm is not ES256 (-7)
 * @internal
 */
function createParameters(params: PublicKeyCredentialParameters): {
  type: 'public-key'
  alg: number
} {
  validateAlgorithm(params.alg)
  return {
    type: 'public-key' as const,
    alg: params.alg,
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
 * Creates credential options in iOS format
 * @throws {InvalidOptionsError} When required fields are missing
 * @internal
 */
export function create(options: create.Options): create.ReturnType {
  const publicKey = options.publicKey
  if (!publicKey) throw new InvalidOptionsError('Missing publicKey')

  validateOptions({
    rp: publicKey.rp,
    user: publicKey.user,
    challenge: publicKey.challenge,
  })

  return {
    rp: publicKey.rp,
    user: {
      id: bufferSourceToBase64(publicKey.user.id),
      name: publicKey.user.name,
      displayName: publicKey.user.displayName,
    },
    challenge: bufferSourceToBase64(publicKey.challenge),
    pubKeyCredParams: publicKey.pubKeyCredParams?.map(createParameters),
    timeout: publicKey.timeout,
    excludeCredentials: publicKey.excludeCredentials?.map(createDescriptor),
    authenticatorSelection: publicKey.authenticatorSelection,
    attestation: publicKey.attestation,
  }
}

export declare namespace create {
  type Options = WebAuthnCredentialCreationOptions
  type ReturnType = CredentialCreationOptions
  type ErrorType = InvalidOptionsError | MissingFieldError | Error
}

/**
 * Parses a native iOS credential response into WebAuthn format
 *
 * @example
 * ```ts
 * const credential = credential.parse(nativeResponse)
 * // Returns WebAuthn formatted credential
 * ```
 *
 * @param response - Native iOS credential response
 * @returns WebAuthn formatted credential
 * @throws {ParseError} If credential cannot be parsed
 */
export function parse(response: parse.Input): parse.ReturnType {
  try {
    const publicKeyBuffer = parseSPKIFromAttestation(
      response.response.attestationObject,
    )

    // Log the public key buffer in different formats
    console.info(
      '[parseSPKIFromAttestation]:publicKeyBuffer length:',
      publicKeyBuffer.byteLength,
    )
    console.info(
      '[parseSPKIFromAttestation]:publicKeyBuffer hex:',
      Array.from(new Uint8Array(publicKeyBuffer))
        .map((b) => b.toString(16).padStart(2, '0'))
        .join(''),
    )
    console.info(
      '[parseSPKIFromAttestation]:publicKeyBuffer base64:',
      bufferSourceToBase64(publicKeyBuffer),
    )

    return {
      id: response.id,
      rawId: base64URLToArrayBuffer(response.rawId),
      response: {
        attestationObject: base64URLToArrayBuffer(
          response.response.attestationObject,
        ),
        clientDataJSON: base64URLToArrayBuffer(
          response.response.clientDataJSON,
        ),
        getAuthenticatorData: () => {
          const data = new Uint8Array(
            base64URLToArrayBuffer(response.response.attestationObject),
          )
          // Skip CBOR header and find authenticator data
          const authenticatorData = data.slice(data[0] === 0x58 ? 2 : 1)
          return authenticatorData.buffer
        },
        getPublicKey: () => publicKeyBuffer,
        getPublicKeyAlgorithm: () => -7, // ES256
        getTransports: () => [],
      },
      type: 'public-key',
      authenticatorAttachment: null,
      getClientExtensionResults: () => ({}),
    }
  } catch (error) {
    throw new ParseError({ cause: error as Error })
  }
}

export declare namespace parse {
  type Input = CredentialAttestationResponse
  type ReturnType = PublicKeyCredential & {
    response: AuthenticatorAttestationResponse
  }
  type ErrorType = ParseError | parseSPKIFromAttestation.ErrorType
}
