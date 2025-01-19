// Note: While these types are normally available from the DOM lib in web environments,
// we need to define them explicitly here for React Native since it doesn't include
// the DOM lib. These definitions match the Web Authentication API specification
// and what ox/coreWebAuthnP256 expects in it's createFn and getFn.

type COSEAlgorithmIdentifier = number

/** @internal */
export type AuthenticatorTransport =
  | 'ble'
  | 'hybrid'
  | 'internal'
  | 'nfc'
  | 'usb'

/** @internal */
export type PublicKeyCredentialType = 'public-key'

/** @internal */
export type CredentialMediationRequirement =
  | 'conditional'
  | 'optional'
  | 'required'
  | 'silent'

/** @internal */
export interface Credential {
  readonly id: string
  readonly type: string
}

/** @internal */
export interface PublicKeyCredential extends Credential {
  readonly authenticatorAttachment: string | null
  readonly rawId: ArrayBuffer
  readonly response: AuthenticatorResponse
  getClientExtensionResults(): AuthenticationExtensionsClientOutputs
}

/** @internal */
export interface CredentialCreationOptions {
  publicKey?: PublicKeyCredentialCreationOptions
  signal?: AbortSignal
}

/** @internal */
export interface CredentialRequestOptions {
  mediation?: CredentialMediationRequirement
  publicKey?: PublicKeyCredentialRequestOptions
  signal?: AbortSignal
}

/** @internal */
export type AttestationConveyancePreference =
  | 'direct'
  | 'enterprise'
  | 'indirect'
  | 'none'

/** @internal */
export interface AuthenticatorSelectionCriteria {
  authenticatorAttachment?: AuthenticatorAttachment
  requireResidentKey?: boolean
  residentKey?: ResidentKeyRequirement
  userVerification?: UserVerificationRequirement
}

/** @internal */
export type ResidentKeyRequirement = 'discouraged' | 'preferred' | 'required'

/** @internal */
export type UserVerificationRequirement =
  | 'discouraged'
  | 'preferred'
  | 'required'

/** @internal */
export type AuthenticatorAttachment = 'cross-platform' | 'platform'

/** @internal */
export interface PublicKeyCredentialCreationOptions {
  attestation?: AttestationConveyancePreference
  authenticatorSelection?: AuthenticatorSelectionCriteria
  challenge: BufferSource
  excludeCredentials?: PublicKeyCredentialDescriptor[]
  extensions?: AuthenticationExtensionsClientInputs
  pubKeyCredParams: PublicKeyCredentialParameters[]
  rp: PublicKeyCredentialRpEntity
  timeout?: number
  user: PublicKeyCredentialUserEntity
}

/** @internal */
export interface AuthenticationExtensionsClientInputs {
  appid?: string
  credProps?: boolean
  hmacCreateSecret?: boolean
  minPinLength?: boolean
}

/** @internal */
export interface PublicKeyCredentialRequestOptions {
  allowCredentials?: PublicKeyCredentialDescriptor[]
  challenge: BufferSource
  extensions?: AuthenticationExtensionsClientInputs
  rpId?: string
  timeout?: number
  userVerification?: UserVerificationRequirement
}

/** @internal */
export interface PublicKeyCredentialParameters {
  type: PublicKeyCredentialType
  alg: number
}

/** @internal */
export interface PublicKeyCredentialRpEntity {
  id?: string
  name: string
}

/** @internal */
export interface PublicKeyCredentialUserEntity {
  displayName: string
  id: BufferSource
  name: string
}

/** @internal */
export interface PublicKeyCredentialDescriptor {
  id: BufferSource
  type: PublicKeyCredentialType
  transports?: AuthenticatorTransport[]
}

/** @internal */
export type BufferSource = ArrayBufferView | ArrayBuffer

/** @internal */
export interface AuthenticatorResponse {
  readonly clientDataJSON: ArrayBuffer
}

/**
 * Available only in secure contexts.
 *
 * [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse)
 */
export interface AuthenticatorAssertionResponse extends AuthenticatorResponse {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse/authenticatorData) */
  readonly authenticatorData: ArrayBuffer
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse/signature) */
  readonly signature: ArrayBuffer
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAssertionResponse/userHandle) */
  readonly userHandle: ArrayBuffer | null
}

/** @internal */
export interface AuthenticatorAttestationResponse
  extends AuthenticatorResponse {
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse/attestationObject) */
  readonly attestationObject: ArrayBuffer
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse/getAuthenticatorData) */
  getAuthenticatorData(): ArrayBuffer
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse/getPublicKey) */
  getPublicKey(): ArrayBuffer | null
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse/getPublicKeyAlgorithm) */
  getPublicKeyAlgorithm(): COSEAlgorithmIdentifier
  /** [MDN Reference](https://developer.mozilla.org/docs/Web/API/AuthenticatorAttestationResponse/getTransports) */
  getTransports(): string[]
}

/** @internal */
export interface AuthenticationExtensionsClientOutputs {
  appid?: boolean
  credProps?: {
    rk: boolean
  }
  hmacCreateSecret?: boolean
  prf?: Record<string, ArrayBuffer>
}
