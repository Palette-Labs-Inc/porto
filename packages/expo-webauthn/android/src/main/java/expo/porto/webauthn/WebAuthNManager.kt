package expo.porto.webauthn

import android.annotation.SuppressLint
import android.content.Context
import android.app.Activity
import androidx.credentials.*
import androidx.credentials.exceptions.CreateCredentialCancellationException
import androidx.credentials.exceptions.CreateCredentialCustomException
import androidx.credentials.exceptions.CreateCredentialException
import androidx.credentials.exceptions.CreateCredentialInterruptedException
import androidx.credentials.exceptions.CreateCredentialProviderConfigurationException
import androidx.credentials.exceptions.CreateCredentialUnknownException
import androidx.credentials.exceptions.GetCredentialCancellationException
import androidx.credentials.exceptions.GetCredentialException
import androidx.credentials.exceptions.GetCredentialInterruptedException
import androidx.credentials.exceptions.GetCredentialProviderConfigurationException
import androidx.credentials.exceptions.GetCredentialUnknownException
import androidx.credentials.exceptions.GetCredentialUnsupportedException
import androidx.credentials.exceptions.NoCredentialException
import androidx.credentials.exceptions.publickeycredential.CreatePublicKeyCredentialDomException
import androidx.credentials.exceptions.publickeycredential.GetPublicKeyCredentialDomException
import expo.modules.kotlin.Promise

class WebAuthNManager(
    context: Context,
    private val activity: Activity
) {
    private val credentialManager = CredentialManager.create(context)

    @SuppressLint("PublicKeyCredential")
    suspend fun createCredential(options: CredentialCreationOptions, promise: Promise) {
        try {
            val request = CreatePublicKeyCredentialRequest(
                requestJson = options.toJsonString()
            )

            val result = credentialManager.createCredential(
                activity,
                request
            )

            handleCreateCredentialResponse(result, promise)
        } catch (e: CreateCredentialException) {
            handleCreateCredentialError(e, promise)
        } catch (e: Exception) {
            promise.reject(AuthenticationFailedException(e.localizedMessage ?: "Unknown error"))
        }
    }

    suspend fun getCredential(options: CredentialRequestOptions, promise: Promise) {
        try {
            val credentialOption = GetPublicKeyCredentialOption(
                requestJson = options.toJsonString()
            )

            val request = GetCredentialRequest(
                credentialOptions = listOf(credentialOption)
            )

            val result = credentialManager.getCredential(
                activity,
                request
            )

            handleGetCredentialResponse(result, promise)
        } catch (e: GetCredentialException) {
            handleGetCredentialError(e, promise)
        } catch (e: Exception) {
            promise.reject(AuthenticationFailedException(e.localizedMessage ?: "Unknown error"))
        }
    }

    private fun handleCreateCredentialResponse(response: CreateCredentialResponse, promise: Promise) {
        try {
            val credentialResponse = response.toCredentialResponse()
            promise.resolve(credentialResponse)
        } catch (e: Exception) {
            promise.reject(AuthenticationFailedException(e.localizedMessage ?: "Failed to process credential response"))
        }
    }

    private fun handleGetCredentialResponse(response: GetCredentialResponse, promise: Promise) {
        try {
            val assertionResponse = response.toAssertionResponse()
            promise.resolve(assertionResponse)
        } catch (e: Exception) {
            promise.reject(AuthenticationFailedException(e.localizedMessage ?: "Failed to process credential response"))
        }
    }

    private fun handleCreateCredentialError(error: CreateCredentialException, promise: Promise) {
        when (error) {
            is CreateCredentialCancellationException ->
                promise.reject(AuthorizationCanceledException())
            is CreateCredentialInterruptedException ->
                promise.reject(AuthorizationNotHandledException())
            is CreateCredentialProviderConfigurationException ->
                promise.reject(NotSupportedException())
            is CreatePublicKeyCredentialDomException ->
                promise.reject(InvalidResponseException())
            is CreateCredentialCustomException ->
                promise.reject(InvalidCreationOptionsException(error.message ?: "Custom error during credential creation"))
            is CreateCredentialUnknownException ->
                promise.reject(UnknownAuthorizationException(error.message ?: "Unknown error during credential creation"))
            else -> 
                promise.reject(UnknownAuthorizationException(error.message ?: "Unexpected error during credential creation"))
        }
    }

    private fun handleGetCredentialError(error: GetCredentialException, promise: Promise) {
        when (error) {
            is GetCredentialCancellationException ->
                promise.reject(AuthorizationCanceledException())
            is GetCredentialInterruptedException ->
                promise.reject(AuthorizationNotHandledException())
            is GetCredentialProviderConfigurationException ->
                promise.reject(NotSupportedException())
            is GetPublicKeyCredentialDomException ->
                promise.reject(InvalidResponseException())
            is NoCredentialException ->
                promise.reject(InvalidCredentialException())
            is GetCredentialUnsupportedException ->
                promise.reject(NotSupportedException())
            is GetCredentialUnknownException ->
                promise.reject(UnknownAuthorizationException(error.message ?: "Unknown error during credential retrieval"))
            else ->
                promise.reject(UnknownAuthorizationException(error.message ?: "Unexpected error during credential retrieval"))
        }
    }
}