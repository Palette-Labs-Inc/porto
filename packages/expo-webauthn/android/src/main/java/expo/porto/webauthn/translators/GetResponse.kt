package expo.porto.webauthn.translators

import android.util.Base64
import androidx.credentials.GetCredentialResponse
import androidx.credentials.PublicKeyCredential
import expo.porto.webauthn.AssertionResponse
import expo.porto.webauthn.AuthenticatorAssertionResponse
import expo.porto.webauthn.InvalidResponseException

object GetResponse {
    fun toAssertionResponse(response: GetCredentialResponse): AssertionResponse {
        val credential = response.credential
        
        if (credential.type != PublicKeyCredential.TYPE_PUBLIC_KEY_CREDENTIAL) {
            throw InvalidResponseException()
        }

        val publicKeyCredential = credential as? PublicKeyCredential
            ?: throw InvalidResponseException()

        return AssertionResponse(
            id = publicKeyCredential.authenticationResponseJson,
            rawId = publicKeyCredential.authenticationResponseJson,
            type = "public-key",
            authenticatorAttachment = "platform", // Android always uses platform authenticator
            response = AuthenticatorAssertionResponse(
                clientDataJSON = publicKeyCredential.authenticationResponseJson,
                authenticatorData = publicKeyCredential.authenticationResponseJson,
                signature = publicKeyCredential.authenticationResponseJson,
                userHandle = null // Optional, can be populated if available in the response
            )
        )
    }
}
