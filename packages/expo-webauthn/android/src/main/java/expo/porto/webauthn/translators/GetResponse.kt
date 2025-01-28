package expo.porto.webauthn.translators

import android.util.Base64
import androidx.credentials.GetCredentialResponse
import androidx.credentials.PublicKeyCredential
import expo.porto.webauthn.AssertionResponse
import expo.porto.webauthn.AuthenticatorAssertionResponse
import expo.porto.webauthn.InvalidResponseException
import org.json.JSONObject

object GetResponse {
    fun toAssertionResponse(response: GetCredentialResponse): AssertionResponse {
        val credential = response.credential
        
        if (credential.type != PublicKeyCredential.TYPE_PUBLIC_KEY_CREDENTIAL) {
            throw InvalidResponseException()
        }

        val publicKeyCredential = credential as? PublicKeyCredential
            ?: throw InvalidResponseException()

        // Parse the authentication response JSON
        val responseData = JSONObject(publicKeyCredential.authenticationResponseJson)
        val rawResponse = responseData.getJSONObject("response")

        return AssertionResponse(
            id = responseData.getString("id"),
            rawId = responseData.getString("id"),
            type = responseData.getString("type"),
            authenticatorAttachment = responseData.optString("authenticatorAttachment", "platform"),
            response = AuthenticatorAssertionResponse(
                clientDataJSON = rawResponse.getString("clientDataJSON"),
                authenticatorData = rawResponse.getString("authenticatorData"),
                signature = rawResponse.getString("signature"),
                userHandle = rawResponse.optString("userHandle", null)
            )
        )
    }
}
