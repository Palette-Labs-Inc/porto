package expo.porto.webauthn.translators

import org.json.JSONArray
import org.json.JSONObject
import expo.porto.webauthn.*

internal object CreateRequest {
    fun toJsonString(options: CredentialCreationOptions): String = JSONObject().apply {
        put("rp", createRelyingPartyJson(options.rp))
        put("user", createUserJson(options.user))
        put("challenge", options.challenge)
        put("pubKeyCredParams", createPubKeyParamsJson(options.pubKeyCredParams))
        
        options.timeout?.let { put("timeout", it.toLong()) }
        options.excludeCredentials?.let { put("excludeCredentials", createExcludeCredentialsJson(it)) }
        options.authenticatorSelection?.let { put("authenticatorSelection", createAuthenticatorSelectionJson(it)) }
        options.attestation?.let { put("attestation", it.value) }
    }.toString()

    private fun createRelyingPartyJson(rp: RelyingParty) = JSONObject().apply {
        put("id", rp.id)
        put("name", rp.name)
    }

    private fun createUserJson(user: User) = JSONObject().apply {
        put("id", user.id)
        put("name", user.name)
        put("displayName", user.displayName)
    }

    private fun createPubKeyParamsJson(params: List<PublicKeyCredentialParameters>) = JSONArray().apply {
        params.forEach { param ->
            put(JSONObject().apply {
                put("type", param.type.value)
                put("alg", param.alg.value)
            })
        }
    }

    private fun createExcludeCredentialsJson(credentials: List<PublicKeyCredentialDescriptor>) = JSONArray().apply {
        credentials.forEach { credential ->
            put(JSONObject().apply {
                put("type", "public-key")
                put("id", credential.id)
                credential.transports?.let { transports ->
                    put("transports", JSONArray(transports))
                }
            })
        }
    }

    private fun createAuthenticatorSelectionJson(selection: AuthenticatorSelectionCriteria) = JSONObject().apply {
        selection.authenticatorAttachment?.let { put("authenticatorAttachment", it) }
        selection.requireResidentKey?.let { put("requireResidentKey", it) }
        selection.residentKey?.let { put("residentKey", it.value) }
        selection.userVerification?.let { put("userVerification", it.value) }
    }
}
