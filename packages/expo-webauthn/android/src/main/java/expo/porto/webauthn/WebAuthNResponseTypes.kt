package expo.porto.webauthn

import android.util.Log
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import org.json.JSONObject
import androidx.credentials.CreateCredentialResponse
import androidx.credentials.CreatePublicKeyCredentialResponse
import androidx.credentials.GetCredentialResponse
import androidx.credentials.PublicKeyCredential
import expo.modules.kotlin.Promise
import expo.porto.webauthn.Base64Utils.toBase64URLString

// MARK: - Record Definitions
data class CredentialResponse(
    @Field val id: String,
    @Field val type: String,
    @Field val authenticatorAttachment: String?,
    @Field val response: AuthenticatorAttestationResponse
) : Record

data class AuthenticatorAttestationResponse(
    @Field val clientDataJSON: String,
    @Field val attestationObject: String
) : Record

data class AssertionResponse(
    @Field val id: String,
    @Field val type: String,
    @Field val authenticatorAttachment: String?,
    @Field val response: AuthenticatorAssertionResponse
) : Record

data class AuthenticatorAssertionResponse(
    @Field val clientDataJSON: String,
    @Field val authenticatorData: String,
    @Field val signature: String,
    @Field val userHandle: String?
) : Record

data class StoredCredentialResponse(
    @Field val id: String,
    @Field val type: String,
    @Field val transports: List<String>?
) : Record

// MARK: - Response Parsing
private object ResponseParser {
    fun createCredentialResponse(response: CreateCredentialResponse): CredentialResponse {
        if (response.type != PublicKeyCredential.TYPE_PUBLIC_KEY_CREDENTIAL) {
            throw InvalidResponseException()
        }

        val publicKeyResponse = response as? CreatePublicKeyCredentialResponse
            ?: throw InvalidResponseException()

        // The response comes as a JSON string that follows the WebAuthN spec
        // Example format:
        // {
        //   "id": "abc123...",
        //   "type": "public-key",
        //   "response": {
        //     "clientDataJSON": "base64url...",
        //     "attestationObject": "base64url..."
        //   }
        // }
        val responseData = JSONObject(publicKeyResponse.registrationResponseJson)
        val rawResponse = responseData.getJSONObject("response")

        Log.d("WebAuthN", "Raw registration response: $responseData")

        return CredentialResponse(
            id = responseData.getString("id").toBase64URLString(),
            type = responseData.getString("type"),
            authenticatorAttachment = responseData.optString("authenticatorAttachment", "platform"),
            response = AuthenticatorAttestationResponse(
                clientDataJSON = rawResponse.getString("clientDataJSON"),
                attestationObject = rawResponse.getString("attestationObject")
            )
        )
    }

    fun createAssertionResponse(response: GetCredentialResponse): AssertionResponse {
        val credential = response.credential
        
        if (credential.type != PublicKeyCredential.TYPE_PUBLIC_KEY_CREDENTIAL) {
            throw InvalidResponseException()
        }

        val publicKeyCredential = credential as? PublicKeyCredential
            ?: throw InvalidResponseException()

        // The response comes as a JSON string that follows the WebAuthN spec
        // Example format:
        // {
        //   "id": "abc123...",
        //   "type": "public-key",
        //   "response": {
        //     "clientDataJSON": "base64url...",
        //     "authenticatorData": "base64url...",
        //     "signature": "base64url...",
        //     "userHandle": "base64url..." (optional)
        //   }
        // }
        val responseData = JSONObject(publicKeyCredential.authenticationResponseJson)
        val rawResponse = responseData.getJSONObject("response")

        Log.d("WebAuthN", "Raw authentication response: $responseData")

        return AssertionResponse(
            id = responseData.getString("id").toBase64URLString(),
            type = responseData.getString("type"),
            authenticatorAttachment = responseData.optString("authenticatorAttachment", "platform"),
            response = AuthenticatorAssertionResponse(
                clientDataJSON = rawResponse.getString("clientDataJSON"),
                authenticatorData = rawResponse.getString("authenticatorData"),
                signature = rawResponse.getString("signature"),
                userHandle = if (rawResponse.has("userHandle")) rawResponse.getString("userHandle") else null
            )
        )
    }
}

// MARK: - Public Extensions
fun CreateCredentialResponse.toCredentialResponse(): CredentialResponse {
    return ResponseParser.createCredentialResponse(this)
}

fun GetCredentialResponse.toAssertionResponse(): AssertionResponse {
    return ResponseParser.createAssertionResponse(this)
}