import ExpoModulesCore
import AuthenticationServices

// MARK: - Type Aliases
/// A string that is base64URL encoded
public typealias Base64URLString = String

/// A string that represents a credential ID in base64URL format
public typealias CredentialIDString = Base64URLString

// MARK: - Enums
/// Represents the COSE algorithm identifier as defined in AuthenticationServices
/// @see https://developer.apple.com/documentation/authenticationservices/ascosealgorithmidentifier
public enum PublicKeyCredentialAlgorithm: Int, Enumerable {
    /// ECDSA with SHA-256
    case es256 = -7
    var asAlgorithmIdentifier: ASCOSEAlgorithmIdentifier {
        switch self {
        case .es256:
            return .ES256
        }
    }
}

public enum PublicKeyCredentialType: String, Enumerable {
    case publicKey = "public-key"
}

/// Represents the transport method for security key credentials
public enum AuthenticatorTransport: String, Enumerable {
    case usb
    case nfc
    case ble
    case hybrid
    
    var asTransport: ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor.Transport? {
        switch self {
        case .ble:
            return .bluetooth
        case .nfc:
            return .nfc
        case .usb:
            return .usb
        default:
            return nil
        }
    }
}

public enum ResidentKeyPreference: String, Enumerable {
    case discouraged
    case preferred
    case required
    
    var asPreference: ASAuthorizationPublicKeyCredentialResidentKeyPreference {
        switch self {
        case .discouraged:
            return .discouraged
        case .preferred:
            return .preferred
        case .required:
            return .required
        }
    }
}

public enum UserVerificationPreference: String, Enumerable {
    case discouraged
    case preferred
    case required
    
    var asPreference: ASAuthorizationPublicKeyCredentialUserVerificationPreference {
        switch self {
        case .discouraged:
            return .discouraged
        case .preferred:
            return .preferred
        case .required:
            return .required
        }
    }
}

public enum AttestationConveyancePreference: String, Enumerable {
    case direct
    case enterprise
    case indirect
    case none
    
    var asKind: ASAuthorizationPublicKeyCredentialAttestationKind {
        switch self {
        case .direct:
            return .direct
        case .enterprise:
            return .enterprise
        case .indirect:
            return .indirect
        case .none:
            return .none
        }
    }
}

// MARK: - Common Types
public struct PublicKeyCredentialDescriptor: Record {
    
    @Field 
    var type: PublicKeyCredentialType = .publicKey
    
    @Field 
    var id: CredentialIDString
    
    @Field 
    var transports: [AuthenticatorTransport]?
    
    func toPlatformDescriptor() throws -> ASAuthorizationPlatformPublicKeyCredentialDescriptor {
        guard let credentialData = Data(base64URLEncoded: id) else {
            throw InvalidCredentialException()
        }
        return ASAuthorizationPlatformPublicKeyCredentialDescriptor(credentialID: credentialData)
    }
    
    func toSecurityKeyDescriptor() throws -> ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor {
        guard let credentialData = Data(base64URLEncoded: id) else {
            throw InvalidCredentialException()
        }
        
        let descriptor = ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor(
            credentialID: credentialData,
            transports: ASAuthorizationSecurityKeyPublicKeyCredentialDescriptor.Transport.allSupported
        )
        
        if let transports = transports, !transports.isEmpty {
            let validTransports = transports.compactMap { $0.asTransport }
            if !validTransports.isEmpty {
                descriptor.transports = validTransports
            }
        }
        
        return descriptor
    }
}

public struct RelyingParty: Record {
    @Field var id: String
    @Field var name: String
}

public struct User: Record {
    @Field var id: Base64URLString
    @Field var name: String
    @Field var displayName: String
} 
