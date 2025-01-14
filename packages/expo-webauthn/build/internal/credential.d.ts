import { type AuthenticatorTransportType, type CredentialUserEntity, WebAuthnError } from './types';
import type { AttestationConveyancePreference, AuthenticatorAttestationResponse, AuthenticatorSelectionCriteria, PublicKeyCredential, PublicKeyCredentialRpEntity, CredentialCreationOptions as WebAuthnCredentialCreationOptions } from './webauthn';
/**
 * Options for creating a new credential
 * @internal
 */
interface CredentialCreationOptions {
    rp: PublicKeyCredentialRpEntity;
    user: CredentialUserEntity;
    challenge: string;
    pubKeyCredParams?: {
        type: 'public-key';
        alg: number;
    }[];
    timeout?: number;
    excludeCredentials?: {
        type?: 'public-key';
        id: string;
        transports?: AuthenticatorTransportType[];
    }[];
    authenticatorSelection?: AuthenticatorSelectionCriteria;
    attestation?: AttestationConveyancePreference;
}
/**
 * Response from a successful credential creation
 * @internal
 */
interface CredentialAttestationResponse {
    id: string;
    rawId: string;
    response: {
        attestationObject: string;
        clientDataJSON: string;
    };
    type: 'public-key';
}
/** Base class for credential errors */
declare class CredentialError extends WebAuthnError {
}
/** Thrown when creation options are invalid */
declare class InvalidOptionsError extends CredentialError {
}
/** Thrown when a required field is missing */
declare class MissingFieldError extends CredentialError {
    constructor(field: string);
}
/** Thrown when credential parsing fails */
declare class ParseError extends CredentialError {
    constructor({ cause }?: {
        cause?: Error;
    });
}
/** Thrown when public key extraction fails */
declare class PublicKeyExtractionError extends CredentialError {
    constructor({ cause }?: {
        cause?: Error;
    });
}
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
export declare function parseSPKIFromAttestation(attestationObject: parseSPKIFromAttestation.Input): parseSPKIFromAttestation.ReturnType;
export declare namespace parseSPKIFromAttestation {
    type Input = string;
    type ReturnType = ArrayBuffer;
    type ErrorType = PublicKeyExtractionError;
}
/**
 * Creates credential options in iOS format
 * @throws {InvalidOptionsError} When required fields are missing
 * @internal
 */
export declare function create(options: create.Options): create.ReturnType;
export declare namespace create {
    type Options = WebAuthnCredentialCreationOptions;
    type ReturnType = CredentialCreationOptions;
    type ErrorType = InvalidOptionsError | MissingFieldError | Error;
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
export declare function parse(response: parse.Input): parse.ReturnType;
export declare namespace parse {
    type Input = CredentialAttestationResponse;
    type ReturnType = PublicKeyCredential & {
        response: AuthenticatorAttestationResponse;
    };
    type ErrorType = ParseError | parseSPKIFromAttestation.ErrorType;
}
export {};
//# sourceMappingURL=credential.d.ts.map