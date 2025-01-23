package expo.modules.passkeys

import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialRequest
import androidx.credentials.GetPublicKeyCredentialOption
import expo.modules.kotlin.AppContext

suspend fun createCredential(
    request: String,
    appContext: AppContext
): String? {
    val credentialManager = CredentialManager.create(appContext.reactContext?.applicationContext!!)
    val createRequest = CreatePublicKeyCredentialRequest(request)

    val result = appContext.currentActivity?.let {
        credentialManager.createCredential(it, createRequest)
    }
    return result?.data?.getString("androidx.credentials.BUNDLE_KEY_REGISTRATION_RESPONSE_JSON")
}

suspend fun getCredential(
    request: String,
    appContext: AppContext
): String? {
    val credentialManager = CredentialManager.create(appContext.reactContext?.applicationContext!!)
    val getCredentialRequest = GetCredentialRequest(listOf(GetPublicKeyCredentialOption(request)))

    val result = appContext.currentActivity?.let {
        credentialManager.getCredential(it, getCredentialRequest)
    }
    return result?.credential?.data?.getString("androidx.credentials.BUNDLE_KEY_AUTHENTICATION_RESPONSE_JSON")
} 
