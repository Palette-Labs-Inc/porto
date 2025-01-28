import ExpoModulesCore
import AuthenticationServices

// MARK: - Credential Creation Response Types
public struct CredentialResponse: Record {
    public init() {}
    
    @Field var id: CredentialIDString
    @Field var type: String  // "public-key", not base64
    @Field var authenticatorAttachment: String?  // "platform", not base64
    @Field var response: AuthenticatorAttestationResponse

    init(id: CredentialIDString, type: String, authenticatorAttachment: String?, response: AuthenticatorAttestationResponse) {
        self.id = id
        self.rawId = rawId
        self.type = type
        self.authenticatorAttachment = authenticatorAttachment
        self.response = response
    }
}

public struct AuthenticatorAttestationResponse: Record {
    public init() {}
    
    @Field var clientDataJSON: Base64URLString
    @Field var attestationObject: Base64URLString

    init(clientDataJSON: Base64URLString, attestationObject: Base64URLString) {
        self.clientDataJSON = clientDataJSON
        self.attestationObject = attestationObject
    }
}

// MARK: - Credential Request Response Types
public struct AssertionResponse: Record {
    public init() {}
    
    @Field var id: CredentialIDString
    @Field var type: String  // "public-key", not base64
    @Field var authenticatorAttachment: String?  // "platform", not base64
    @Field var response: AuthenticatorAssertionResponse

    init(id: CredentialIDString, type: String, authenticatorAttachment: String?, response: AuthenticatorAssertionResponse) {
        self.id = id
        self.type = type
        self.authenticatorAttachment = authenticatorAttachment
        self.response = response
    }
}

public struct AuthenticatorAssertionResponse: Record {
    public init() {}
    
    @Field var clientDataJSON: Base64URLString
    @Field var authenticatorData: Base64URLString
    @Field var signature: Base64URLString
    @Field var userHandle: Base64URLString?

    init(clientDataJSON: Base64URLString, authenticatorData: Base64URLString, signature: Base64URLString, userHandle: Base64URLString?) {
        self.clientDataJSON = clientDataJSON
        self.authenticatorData = authenticatorData
        self.signature = signature
        self.userHandle = userHandle
    }
}

public struct StoredCredentialResponse: Record {
    public init() {}
    @Field var id: CredentialIDString
    @Field var type: String  // "public-key", not base64
    @Field var transports: [String]?  // Transport strings, not base64
}
