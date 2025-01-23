package expo.porto.webauthn

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.porto.webauthn.translators.CreateRequest
import expo.porto.webauthn.translators.GetRequest
import org.json.JSONArray
import org.json.JSONObject
import android.util.Base64

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
    internal fun toJson(): String = CreateRequest.toJsonString(this)

    internal fun validate() {
        require(rp.name.isNotEmpty()) { "Missing relying party name" }
        require(user.name.isNotEmpty()) { "Missing user name" }
        require(challenge.isNotEmpty()) { "Missing challenge" }
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
    internal fun toJson(): String = GetRequest.toJsonString(this)

    internal fun validate() {
        require(challenge.isNotEmpty()) { "Missing challenge" }
        require(rpId.isNotEmpty()) { "Missing rpId" }
    }
}