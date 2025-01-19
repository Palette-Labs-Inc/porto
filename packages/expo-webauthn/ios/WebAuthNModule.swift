import ExpoModulesCore
import AuthenticationServices

@available(iOS 15.0, *)
public final class WebAuthNModule: Module {
    private let manager = WebAuthNManager()
    
    public func definition() -> ModuleDefinition {
        Name("ExpoWebAuthN")
        
        AsyncFunction("createCredential") { (options: CredentialCreationOptions, promise: Promise) in
            manager.createCredential(options: options, promise: promise)
        }
        
        AsyncFunction("getCredential") { (options: CredentialRequestOptions, promise: Promise) in
            manager.getCredential(options: options, promise: promise)
        }
    }
}