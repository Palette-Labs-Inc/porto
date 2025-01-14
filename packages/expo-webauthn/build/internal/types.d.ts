/**
 * Supported authenticator transport types in iOS AuthenticationServices
 * @see https://developer.apple.com/documentation/authenticationservices/asauthorizationsecuritykeypublickeycredentialdescriptor/transport
 * @internal
 */
export type AuthenticatorTransportType = 'ble' | 'hybrid' | 'nfc' | 'usb';
/**
 * User entity format for credential operations
 * @internal
 */
export interface CredentialUserEntity {
    displayName: string;
    id: string;
    name: string;
}
/**
 * Base error class for WebAuthn operations
 */
export declare class WebAuthnError extends Error {
    cause?: Error;
    constructor(message: string, options?: {
        metaMessages?: string[];
        cause?: Error;
    });
    metaMessages?: string[];
}
//# sourceMappingURL=types.d.ts.map