package expo.porto.webauthn.translators

import android.util.Base64
import androidx.credentials.CreateCredentialResponse
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.PublicKeyCredential
import expo.porto.webauthn.CredentialResponse
import expo.porto.webauthn.AuthenticatorAttestationResponse
import expo.porto.webauthn.InvalidResponseException

object CreateResponse {
    fun toCredentialResponse(response: CreateCredentialResponse): CredentialResponse {
        if (response.type != PublicKeyCredential.TYPE_PUBLIC_KEY_CREDENTIAL) {
            throw InvalidResponseException()
        }

        val publicKeyResponse = response as? CreatePublicKeyCredentialResponse
            ?: throw InvalidResponseException()

        return CredentialResponse(
            id = publicKeyResponse.registrationResponseJson,
            rawId = publicKeyResponse.registrationResponseJson,
            type = "public-key",
            authenticatorAttachment = "platform", // Android always uses platform authenticator
            response = AuthenticatorAttestationResponse(
                clientDataJSON = publicKeyResponse.registrationResponseJson,
                attestationObject = publicKeyResponse.registrationResponseJson
            )
        )
    }
}
