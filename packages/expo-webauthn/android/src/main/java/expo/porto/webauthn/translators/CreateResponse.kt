package expo.porto.webauthn.translators

import android.util.Base64
import androidx.credentials.CreateCredentialResponse
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.PublicKeyCredential
import expo.porto.webauthn.CredentialResponse
import expo.porto.webauthn.AuthenticatorAttestationResponse
import expo.porto.webauthn.InvalidResponseException
import org.json.JSONObject

object CreateResponse {
    fun toCredentialResponse(response: CreateCredentialResponse): CredentialResponse {
        if (response.type != PublicKeyCredential.TYPE_PUBLIC_KEY_CREDENTIAL) {
            throw InvalidResponseException()
        }

        val publicKeyResponse = response as? CreatePublicKeyCredentialResponse
            ?: throw InvalidResponseException()

        // Parse the registration response JSON
        val responseData = JSONObject(publicKeyResponse.registrationResponseJson)
        val rawResponse = responseData.getJSONObject("response")

        return CredentialResponse(
            id = responseData.getString("id"),
            rawId = responseData.getString("rawId"),
            type = responseData.getString("type"),
            authenticatorAttachment = responseData.optString("authenticatorAttachment", "platform"),
            response = AuthenticatorAttestationResponse(
                clientDataJSON = rawResponse.getString("clientDataJSON"),
                attestationObject = rawResponse.getString("attestationObject")
            )
        )
    }
}