package expo.porto.webauthn

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.porto.webauthn.translators.CreateRequest
import expo.porto.webauthn.translators.GetRequest

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
    internal fun toJsonString(): String = CreateRequest.toJsonString(this)
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
    internal fun toJsonString(): String = GetRequest.toJsonString(this)
}