package expo.modules.webauthn

import android.content.Context
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class WebAuthNModule : Module() {
    private val moduleScope = CoroutineScope(Dispatchers.Default)
    private lateinit var manager: WebAuthNManager
    
    // Safely get the React context
    private val reactContext: Context
        get() = appContext.reactContext ?: throw WebAuthNException("React context is lost")

    override fun definition() = ModuleDefinition {
        Name("ExpoWebAuthN")

        OnCreate {
            manager = WebAuthNManager(reactContext)
        }

        AsyncFunction("createCredential") { options: CredentialCreationOptions, promise: Promise ->
            moduleScope.launch {
                try {
                    manager.createCredential(options, promise)
                } catch (e: Exception) {
                    promise.reject(
                        AuthenticationFailedException(
                            e.localizedMessage ?: "Unknown error during credential creation"
                        )
                    )
                }
            }
        }

        AsyncFunction("getCredential") { options: CredentialRequestOptions, promise: Promise ->
            moduleScope.launch {
                try {
                    manager.getCredential(options, promise)
                } catch (e: Exception) {
                    promise.reject(
                        AuthenticationFailedException(
                            e.localizedMessage ?: "Unknown error during credential retrieval"
                        )
                    )
                }
            }
        }
    }
}