package expo.porto.webauthn.translators

import org.json.JSONArray
import org.json.JSONObject
import expo.porto.webauthn.*
import expo.porto.webauthn.translators.Base64Utils.fromBase64URLString

internal object GetRequest {
    fun toJsonString(options: CredentialRequestOptions): String = JSONObject().apply {
        put("challenge", options.challenge)
        put("rpId", options.rpId)
        
        options.allowCredentials?.let { put("allowCredentials", createAllowCredentialsJson(it)) }
        options.userVerification?.let { put("userVerification", it.value) }
        options.timeout?.let { put("timeout", it.toLong()) }
    }.toString()

    private fun createAllowCredentialsJson(credentials: List<PublicKeyCredentialDescriptor>) = JSONArray().apply {
        credentials.forEach { credential ->
            put(JSONObject().apply {
                put("type", "public-key")
                put("id", credential.id.fromBase64URLString())
                credential.transports?.let { transports ->
                    put("transports", JSONArray(transports))
                }
            })
        }
    }
}
