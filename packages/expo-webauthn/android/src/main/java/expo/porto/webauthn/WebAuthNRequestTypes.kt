package expo.porto.webauthn

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.porto.webauthn.translators.CreateRequest
import expo.porto.webauthn.translators.GetRequest
import expo.porto.webauthn.translators.Base64Utils.toBase64URLString
import org.json.JSONObject
import org.json.JSONArray
import android.util.Log

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
    internal fun toJsonString(): String {
        return JSONObject().apply {
            put("rp", JSONObject().apply {
                put("id", rp.id)
                put("name", rp.name)
            })
            put("user", JSONObject().apply {
                put("id", user.id.toBase64URLString())
                put("name", user.name)
                put("displayName", user.displayName)
            })
            put("challenge", challenge.toBase64URLString())
            // ... rest of the conversion ...
        }.toString()
    }
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
    internal fun toJsonString(): String {
        return JSONObject().apply {
            put("challenge", challenge.toBase64URLString())
            put("rpId", rpId)
            
            allowCredentials?.let { credentials ->
                put("allowCredentials", JSONArray().apply {
                    credentials.forEach { credential ->
                        put(credential.toJSON())
                    }
                })
            }
            
            userVerification?.let { put("userVerification", it.value) }
            timeout?.let { put("timeout", it.toLong()) }
        }.toString()
    }
}