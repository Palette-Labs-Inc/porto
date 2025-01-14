import ExpoModulesCore
import AuthenticationServices

// MARK: - Credential Creation Types
/// Represents the parameters for creating a new public key credential
public struct CredentialCreationOptions: Record {
    public init() {}
    @Field var rp: RelyingParty
    @Field var user: User
    @Field var challenge: Base64URLString
    @Field var pubKeyCredParams: [PublicKeyCredentialParameters]?
    @Field var timeout: Double?
    @Field var excludeCredentials: [PublicKeyCredentialDescriptor]?
    @Field var authenticatorSelection: AuthenticatorSelectionCriteria?
    @Field var attestation: AttestationConveyancePreference?
    
    func validate() throws {
        guard !rp.name.isEmpty else {
            throw InvalidCreationOptionsException("Missing relying party name")
        }
        guard !user.name.isEmpty else {
            throw InvalidCreationOptionsException("Missing user name")
        }
        guard !challenge.isEmpty else {
            throw InvalidCreationOptionsException("Missing challenge")
        }
    }
}

/// Represents the parameters for creating a new public key credential
/// - Note: Follows the WebAuthn Level 2 specification and AuthenticationServices framework
/// @see https://developer.apple.com/documentation/authenticationservices/asauthorizationpublickeycredentialparameters
public struct PublicKeyCredentialParameters: Record {
    public init() {}
    
    @Field var type: PublicKeyCredentialType = .publicKey
    
    @Field var alg: PublicKeyCredentialAlgorithm = .es256
    
    func toASParameters() throws -> ASAuthorizationPublicKeyCredentialParameters {
        guard type == .publicKey else {
            throw InvalidCreationOptionsException("Invalid credential type")
        }
        guard alg == .es256 else {
            throw InvalidCreationOptionsException("Unsupported algorithm")
        }
        
        return ASAuthorizationPublicKeyCredentialParameters(algorithm: alg.asAlgorithmIdentifier)
    }
}

/// Represents the criteria for selecting an authenticator
public struct AuthenticatorSelectionCriteria: Record {
    public init() {}
    
    @Field
    var authenticatorAttachment: String?
    
    @Field
    var requireResidentKey: Bool?
    
    @Field
    var residentKey: ResidentKeyPreference?
    
    @Field
    var userVerification: UserVerificationPreference?
}

// MARK: - Credential Request Types
public struct CredentialRequestOptions: Record {
    public init() {}
    @Field var challenge: Base64URLString
    @Field var rpId: String
    @Field var allowCredentials: [PublicKeyCredentialDescriptor]?
    @Field var userVerification: UserVerificationPreference?
    @Field var timeout: Double?
}
