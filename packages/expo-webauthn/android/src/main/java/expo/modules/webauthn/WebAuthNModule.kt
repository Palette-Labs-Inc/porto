package expo.modules.webauthn

import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition

class WebAuthNModule : Module() {
    private val manager = WebAuthNManager()

    override fun definition() = ModuleDefinition {
        Name("ExpoWebAuthN")

        AsyncFunction("createCredential") { options: CredentialCreationOptions ->
            manager.createCredential(options)
        }

        AsyncFunction("getCredential") { options: CredentialRequestOptions ->
            manager.getCredential(options)
        }
    }
}