package expo.modules.webauthn

import android.app.Activity
import android.content.Context
import android.os.Build
import androidx.credentials.CreateCredentialResponse
import androidx.credentials.CreatePublicKeyCredentialRequest
import androidx.credentials.CredentialManager
import androidx.credentials.GetCredentialResponse
import androidx.credentials.GetPublicKeyCredentialOption
import androidx.credentials.PublicKeyCredential
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.GetCredentialException

class WebAuthNManager(private val context: Context) {
    private val credentialManager = CredentialManager.create(context)

    suspend fun createCredential(options: CredentialCreationOptions): CredentialResponse {
        try {
            val request = CreatePublicKeyCredentialRequest(options.toJson())
            val response = credentialManager.createCredential(
                context as Activity,
                request
            ) as CreateCredentialResponse
            return CredentialResponse.fromPublicKeyCredential(response.credential as PublicKeyCredential)
        } catch (e: CreateCredentialException) {
            throw mapToWebAuthNException(e)
        }
    }

    suspend fun getCredential(options: CredentialRequestOptions): AssertionResponse {
        try {
            val request = GetPublicKeyCredentialOption(options.toJson())
            val response = credentialManager.getCredential(
                context as Activity,
                request
            ) as GetCredentialResponse
            return AssertionResponse.fromPublicKeyCredential(response.credential as PublicKeyCredential)
        } catch (e: GetCredentialException) {
            throw mapToWebAuthNException(e)
        }
    }

    private fun mapToWebAuthNException(e: Exception): Exception {
        return when (e) {
            is CreateCredentialException -> OperationException("Failed to create credential: ${e.message}")
            is GetCredentialException -> OperationException("Failed to get credential: ${e.message}")
            else -> AuthenticationFailedException(e.message ?: "Unknown error")
        }
    }
} 