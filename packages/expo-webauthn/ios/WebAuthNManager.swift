import AuthenticationServices
import ExpoModulesCore

// Set to retain pending auth requests
var pendingAuthRequests: Set<WebAuthNResponder> = Set<WebAuthNResponder>()

@available(iOS 15.0, *)
class WebAuthNResponder: NSObject, ASAuthorizationControllerDelegate, ASAuthorizationControllerPresentationContextProviding {
    private let promise: Promise
    
    init(promise: Promise) {
        self.promise = promise
        super.init()
    }
    
    func performAuth(controller: ASAuthorizationController) {
        controller.delegate = self
        controller.presentationContextProvider = self
        pendingAuthRequests.insert(self)
        controller.performRequests()
    }
    
    func presentationAnchor(for controller: ASAuthorizationController) -> ASPresentationAnchor {
        let scene = UIApplication.shared.connectedScenes.first as? UIWindowScene
        return scene?.windows.first ?? UIWindow()
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithError error: Error) {
        if let error: ASAuthorizationError = error as? ASAuthorizationError {
            switch error.code {
            case .canceled:
                promise.reject(AuthorizationCanceledException())
            case .invalidResponse:
                promise.reject(InvalidResponseException())
            case .notHandled:
                promise.reject(AuthorizationNotHandledException())
            case .failed:
                promise.reject(AuthorizationFailedException())
            case .notInteractive:
                promise.reject(NotInteractiveException())
            case .unknown:
                promise.reject(UnknownAuthorizationException(error.localizedDescription))
            @unknown default:
                promise.reject(UnknownAuthorizationException("Unexpected error: \(error.localizedDescription)"))
            }
        } else {
            promise.reject(AuthenticationFailedException(error.localizedDescription))
        }
        pendingAuthRequests.remove(self)
    }
    
    func authorizationController(controller: ASAuthorizationController, didCompleteWithAuthorization authorization: ASAuthorization) {
        if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialRegistration {
            let response = CredentialResponse(
                id: credential.credentialID.toBase64URLEncodedString(),
                type: "public-key",
                authenticatorAttachment: "platform",
                response: AuthenticatorAttestationResponse(
                    clientDataJSON: credential.rawClientDataJSON.toBase64URLEncodedString(),
                    attestationObject: credential.rawAttestationObject?.toBase64URLEncodedString() ?? ""
                )
            )
            promise.resolve(response)
        } else if let credential = authorization.credential as? ASAuthorizationPlatformPublicKeyCredentialAssertion {
            let response = AssertionResponse(
                id: credential.credentialID.toBase64URLEncodedString(),
                type: "public-key",
                authenticatorAttachment: "platform",
                response: AuthenticatorAssertionResponse(
                    clientDataJSON: credential.rawClientDataJSON.toBase64URLEncodedString(),
                    authenticatorData: credential.rawAuthenticatorData.toBase64URLEncodedString(),
                    signature: credential.signature.toBase64URLEncodedString(),
                    userHandle: credential.userID.toBase64URLEncodedString()
                )
            )
            print("credential.rawClientDataJSON, \(credential.rawClientDataJSON)")
            promise.resolve(response)
        } else {
            promise.reject(InvalidCredentialException())
        }
        pendingAuthRequests.remove(self)
    }
}

@available(iOS 15.0, *)
public class WebAuthNManager {
    private let platformProvider: ASAuthorizationPlatformPublicKeyCredentialProvider
    private let securityKeyProvider: ASAuthorizationSecurityKeyPublicKeyCredentialProvider
    
    init() {
        self.platformProvider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: "")
        self.securityKeyProvider = ASAuthorizationSecurityKeyPublicKeyCredentialProvider(relyingPartyIdentifier: "")
    }
    
    public func createCredential(options: CredentialCreationOptions, promise: Promise) {
        do {
            guard let challenge = Data(base64URLEncoded: options.challenge) else {
                throw InvalidChallengeException()
            }
            
            guard let userId = Data(base64URLEncoded: options.user.id) else {
                throw InvalidUserException()
            }
            
            if userId.isEmpty {
                throw InvalidUserException()
            }
            
            let request = try configureCreateRequest(
                challenge: challenge,
                userId: userId,
                options: options
            )
            
            let controller = ASAuthorizationController(authorizationRequests: [request])
            let responder = WebAuthNResponder(promise: promise)
            responder.performAuth(controller: controller)
            
        } catch {
            promise.reject(error)
        }
    }
    
    public func getCredential(options: CredentialRequestOptions, promise: Promise) {
        do {
            guard let challenge = Data(base64URLEncoded: options.challenge) else {
                throw InvalidChallengeException()
            }
            
            let request = try configureGetRequest(
                challenge: challenge,
                options: options
            )
            
            let controller = ASAuthorizationController(authorizationRequests: [request])
            let responder = WebAuthNResponder(promise: promise)
            responder.performAuth(controller: controller)
            
        } catch {
            promise.reject(error)
        }
    }
    
    private func configureCreateRequest(
        challenge: Data,
        userId: Data,
        options: CredentialCreationOptions
    ) throws -> ASAuthorizationPlatformPublicKeyCredentialRegistrationRequest {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: options.rp.id)
        
        let request = provider.createCredentialRegistrationRequest(
            challenge: challenge,
            name: options.user.name,
            userID: userId
        )

        // Configure authenticator selection
        if let authenticatorSelection = options.authenticatorSelection {
            if let userVerification = authenticatorSelection.userVerification {
                request.userVerificationPreference = userVerification.asPreference
            }
        }

        // Configure attestation preference
        if let attestation = options.attestation {
            request.attestationPreference = attestation.asKind
        }

        // Configure excluded credentials
        if let excludeCredentials = options.excludeCredentials {
            if #available(iOS 17.4, *) {
                request.excludedCredentials = try excludeCredentials.map { try $0.toPlatformDescriptor() }
            }
        }

        return request
    }
    
    private func configureGetRequest(
        challenge: Data,
        options: CredentialRequestOptions
    ) throws -> ASAuthorizationPlatformPublicKeyCredentialAssertionRequest {
        let provider = ASAuthorizationPlatformPublicKeyCredentialProvider(relyingPartyIdentifier: options.rpId)
        
        let request = provider.createCredentialAssertionRequest(
            challenge: challenge
        )

        // Configure allowed credentials
        if let allowCredentials = options.allowCredentials {
            request.allowedCredentials = try allowCredentials.map { try $0.toPlatformDescriptor() }
        }

        // Configure user verification preference
        if let userVerification = options.userVerification {
            request.userVerificationPreference = userVerification.asPreference
        }

        return request
    }
} 
