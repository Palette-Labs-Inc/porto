package expo.porto.webauthn

import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.GetCredentialException
import expo.modules.kotlin.Promise
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import kotlinx.coroutines.CoroutineScope
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.launch

class WebAuthNModule : Module() {
    private val mainScope = CoroutineScope(Dispatchers.Default)

    override fun definition() = ModuleDefinition {
        Name("ExpoWebAuthN")

        AsyncFunction("createCredential") { request: String, promise: Promise ->
                mainScope.launch {
                    try {
                        val response = createCredential(request, appContext)
                        promise.resolve(response)
                    } catch (e: CreateCredentialException) {
                        handleCreateCredentialFailure(e, promise)
                    }
                }
        }

        AsyncFunction("getCredential") { request: String, promise: Promise ->
            mainScope.launch {
                try {
                    val response = getCredential(request, appContext)
                    promise.resolve(response)
                } catch (e: GetCredentialException) {
                    handleGetCredentialFailure(e, promise)
                }
            }
        }
    }
}