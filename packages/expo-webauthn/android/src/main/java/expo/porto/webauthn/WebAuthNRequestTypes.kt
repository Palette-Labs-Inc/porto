package expo.porto.webauthn

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import org.json.JSONObject
import org.json.JSONArray
import expo.porto.webauthn.Base64Utils.toBase64URLString

// MARK: - Credential Creation Types
data class CredentialCreationOptions(
    @Field
    val rp: RelyingParty,

    @Field
    val user: User,

    @Field
    val challenge: Base64URLString,

    @Field
    val pubKeyCredParams: List<PublicKeyCredentialParameters>,

    @Field
    val timeout: Double? = null,

    @Field
    val excludeCredentials: List<PublicKeyCredentialDescriptor>? = null,

    @Field
    val authenticatorSelection: AuthenticatorSelectionCriteria? = null,

    @Field
    val attestation: AttestationConveyancePreference? = null
) : Record {
    internal fun toJsonString(): String = RequestParser.createCredentialOptionsJson(this)
}

data class PublicKeyCredentialParameters(
    @Field
    val type: PublicKeyCredentialType = PublicKeyCredentialType.PUBLIC_KEY,

    @Field
    val alg: PublicKeyCredentialAlgorithm = PublicKeyCredentialAlgorithm.ES256
) : Record

data class AuthenticatorSelectionCriteria(
    @Field
    val authenticatorAttachment: String? = null,

    @Field
    val requireResidentKey: Boolean? = null,

    @Field
    val residentKey: ResidentKeyPreference? = null,

    @Field
    val userVerification: UserVerificationPreference? = null
) : Record

// MARK: - Credential Request Types
data class CredentialRequestOptions(
    @Field
    val challenge: Base64URLString,

    @Field
    val rpId: String,

    @Field
    val allowCredentials: List<PublicKeyCredentialDescriptor>? = null,

    @Field
    val userVerification: UserVerificationPreference? = null,

    @Field
    val timeout: Double? = null
) : Record {
    internal fun toJsonString(): String = RequestParser.createRequestOptionsJson(this)
}

// MARK: - Request Parsing
private object RequestParser {
    fun createCredentialOptionsJson(options: CredentialCreationOptions): String {
        return JSONObject().apply {
            put("rp", createRelyingPartyJson(options.rp))
            put("user", createUserJson(options.user))
            put("challenge", options.challenge.toBase64URLString())
            put("pubKeyCredParams", createPubKeyParamsJson(options.pubKeyCredParams))
            
            options.timeout?.let { put("timeout", it.toLong()) }
            options.excludeCredentials?.let { put("excludeCredentials", createCredentialDescriptorsJson(it)) }
            options.authenticatorSelection?.let { put("authenticatorSelection", createAuthenticatorSelectionJson(it)) }
            options.attestation?.let { put("attestation", it.value) }
        }.toString()
    }

    fun createRequestOptionsJson(options: CredentialRequestOptions): String {
        return JSONObject().apply {
            put("challenge", options.challenge.toBase64URLString())
            put("rpId", options.rpId)
            
            options.allowCredentials?.let { put("allowCredentials", createCredentialDescriptorsJson(it)) }
            options.userVerification?.let { put("userVerification", it.value) }
            options.timeout?.let { put("timeout", it.toLong()) }
        }.toString()
    }

    private fun createRelyingPartyJson(rp: RelyingParty) = JSONObject().apply {
        put("id", rp.id)
        put("name", rp.name)
    }

    private fun createUserJson(user: User) = JSONObject().apply {
        put("id", user.id.toBase64URLString())
        put("name", user.name)
        put("displayName", user.displayName)
    }

    private fun createPubKeyParamsJson(params: List<PublicKeyCredentialParameters>) = JSONArray().apply {
        params.forEach { param ->
            put(JSONObject().apply {
                put("type", "public-key")
                put("alg", param.alg.value)
            })
        }
    }

    private fun createCredentialDescriptorsJson(credentials: List<PublicKeyCredentialDescriptor>) = JSONArray().apply {
        credentials.forEach { credential ->
            put(JSONObject().apply {
                put("type", "public-key")
                put("id", credential.id.toBase64URLString())
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