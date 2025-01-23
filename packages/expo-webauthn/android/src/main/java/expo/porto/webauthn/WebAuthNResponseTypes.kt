package expo.porto.webauthn

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record

// MARK: - Credential Creation Response Types
data class CredentialResponse(
    @Field
    val id: String,

    @Field
    val rawId: String,

    @Field
    val type: String,  // "public-key"

    @Field
    val authenticatorAttachment: String? = null,  // "platform"

    @Field
    val response: AuthenticatorAttestationResponse
) : Record

data class AuthenticatorAttestationResponse(
    @Field
    val clientDataJSON: String,

    @Field
    val attestationObject: String
) : Record

// MARK: - Credential Request Response Types
data class AssertionResponse(
    @Field
    val id: String,

    @Field
    val rawId: String,

    @Field
    val type: String,  // "public-key"

    @Field
    val authenticatorAttachment: String? = null,  // "platform"

    @Field
    val response: AuthenticatorAssertionResponse
) : Record

data class AuthenticatorAssertionResponse(
    @Field
    val clientDataJSON: String,

    @Field
    val authenticatorData: String,

    @Field
    val signature: String,

    @Field
    val userHandle: String? = null
) : Record

data class StoredCredentialResponse(
    @Field
    val id: String,

    @Field
    val type: String,  // "public-key"

    @Field
    val transports: List<String>? = null  // Transport strings
) : Record