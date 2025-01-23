package expo.modules.passkeys

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

fun handleCreateFailure(e: CreateCredentialException, promise: Promise) {
    when (e) {
        is CreatePublicKeyCredentialDomException -> {
            promise.reject("CreatePublicKeyCredentialDomException", e.domError.toString(), e)
        }
        is CreateCredentialCancellationException -> {
            promise.reject(
                "CreateCredentialCancellationException",
                e.message,
                e
            )
        }
        is CreateCredentialInterruptedException -> {
            promise.reject(
                "CreateCredentialInterruptedException",
                e.message,
                e
            )
        }
        is CreateCredentialProviderConfigurationException -> {
            promise.reject(
                "CreateCredentialProviderConfigurationException",
                e.message,
                e
            )
        }
        is CreateCredentialUnknownException -> {
            promise.reject(
                "CreateCredentialUnknownException",
                e.message,
                e
            )
        }
        is CreateCredentialCustomException -> {
            promise.reject(
                "CreateCredentialCustomException",
                e.message,
                e
            )
        }
        else -> promise.reject("Error", e.message, e)
    }
}

fun handleGetFailure(e: GetCredentialException, promise: Promise) {
    when (e) {
        is GetPublicKeyCredentialDomException -> {
            promise.reject("GetPublicKeyCredentialDomException", e.domError.toString(), e)
        }
        is GetCredentialInterruptedException -> {
            promise.reject("GetCredentialInterruptedException", e.message, e)
        }
        is GetCredentialCancellationException -> {
            promise.reject(
                "GetCredentialCancellationException",
                e.message,
                e
            )
        }
        is GetCredentialUnknownException -> {
            promise.reject("GetCredentialUnknownException", e.message, e)
        }
        is GetCredentialProviderConfigurationException -> {
            promise.reject(
                "GetCredentialProviderConfigurationException",
                e.message,
                e
            )
        }
        is GetCredentialUnsupportedException -> {
            promise.reject(
                "GetCredentialUnsupportedException",
                e.message,
                e
            )
        }
        is NoCredentialException -> {
            promise.reject(
                "NoCredentialException",
                e.message,
                e
            )
        }
        else -> promise.reject("Error", e.message, e)
    }
} 