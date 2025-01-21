import { Errors } from 'ox'
import { base64URLToArrayBuffer, bufferSourceToBase64 } from './utils'
import type * as internal from './webauthn'

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
 * @param attestationObject - Base64URL encoded native module attestation object
 * @returns ArrayBuffer containing the public key in SPKI format
 */
export function parseSPKIFromAttestation(
  attestationObject: parseSPKIFromAttestation.Parameters,
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
  /** Base64URL encoded attestation object */
  type Parameters = string

  /** ArrayBuffer containing the public key in SPKI format */
  type ReturnType = ArrayBuffer

  type ErrorType = PublicKeyExtractionError
}

// ============= Validation Functions =============

/**
 * Validates that the algorithm is supported
 * @internal
 */
function validateAlgorithm(alg: number): void {
  if (alg !== -7) {
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
 * @internal
 */
function validateOptions(options: {
  rp: internal.PublicKeyCredentialRpEntity | undefined
  user: internal.PublicKeyCredentialUserEntity | undefined
  challenge: internal.BufferSource | undefined
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
 * Creates credential parameters in iOS format
 * @internal
 */
function createParameters(params: internal.PublicKeyCredentialParameters): {
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
 * Creates native module credential creation options from WebAuthn options.
 *
 * @example
 * ```ts
 * const nativeOptions = createNativeCredential({
 *   publicKey: {
 *     rp: { id: 'example.com', name: 'Example' },
 *     user: { id: new Uint8Array([1,2,3]), name: 'user', displayName: 'User' },
 *     challenge: new Uint8Array([1,2,3])
 *   }
 * })
 * ```
 *
 * @param options - WebAuthn credential creation options
 * @returns Native module credential creation options
 */
export function createNativeCredential(
  options: createNativeCredential.Parameters,
): createNativeCredential.ReturnType {
  try {
    const publicKey = options.publicKey
    if (!publicKey) {
      throw new InvalidOptionsError('Missing publicKey')
    }

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
  } catch (error) {
    if (
      error instanceof InvalidOptionsError ||
      error instanceof MissingFieldError
    ) {
      throw error
    }
    throw new InvalidOptionsError('Failed to create credential options', {
      cause: error as Error,
    })
  }
}

export declare namespace createNativeCredential {
  type Parameters = internal.CredentialCreationOptions

  /**
   * Native module credential creation format.
   * This is the format expected by the native module for creating credentials.
   */
  type ReturnType = {
    rp: internal.PublicKeyCredentialRpEntity
    user: {
      displayName: string
      id: string
      name: string
    }
    challenge: string
    pubKeyCredParams?: {
      type: 'public-key'
      alg: number
    }[]
    timeout?: number
    excludeCredentials?: {
      type?: 'public-key'
      id: string
      transports?: internal.AuthenticatorTransportType[]
    }[]
    authenticatorSelection?: internal.AuthenticatorSelectionCriteria
    attestation?: internal.AttestationConveyancePreference
  }

  type ErrorType = InvalidOptionsError | MissingFieldError | Error
}

/**
 * Parses a native module credential attestation response into WebAuthn format.
 *
 * @example
 * ```ts
 * const credential = fromNativeAttestation(nativeResponse)
 * // Returns WebAuthn formatted credential
 * ```
 *
 * @param response - Native module credential attestation response
 * @returns WebAuthn formatted credential
 */
export function fromNativeAttestation(
  response: fromNativeAttestation.Parameters,
): fromNativeAttestation.ReturnType {
  try {
    const publicKeyBuffer = parseSPKIFromAttestation(
      response.response.attestationObject,
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

export declare namespace fromNativeAttestation {
  /**
   * Native module credential attestation response format.
   * This is the format returned by the native module after credential creation.
   */
  type Parameters = {
    id: string
    rawId: string
    response: {
      attestationObject: string
      clientDataJSON: string
    }
    type: 'public-key'
  }

  type ReturnType = internal.PublicKeyCredential & {
    response: internal.AuthenticatorAttestationResponse
  }

  type ErrorType = ParseError | parseSPKIFromAttestation.ErrorType
}

// ============= Errors =============

/** Thrown when credential parsing fails */
export class ParseError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'WebAuthN.ParseError' as const
  constructor(options: { cause?: Error } = {}) {
    super('Failed to parse credential.', options)
  }
}

/** Thrown when required options are invalid */
export class InvalidOptionsError extends Errors.BaseError<Error | undefined> {
  override readonly name = 'WebAuthN.InvalidOptionsError' as const
  constructor(
    message: string,
    options: { metaMessages?: string[]; cause?: Error } = {},
  ) {
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

/** Thrown when public key extraction fails */
export class PublicKeyExtractionError extends Errors.BaseError<
  Error | undefined
> {
  override readonly name = 'WebAuthN.PublicKeyExtractionError' as const
  constructor(options: { cause?: Error } = {}) {
    super('Failed to extract public key from attestation.', options)
  }
}
