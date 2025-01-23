package expo.porto.webauthn

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import expo.modules.kotlin.types.Enumerable
import android.util.Base64
import androidx.credentials.PublicKeyCredential

// MARK: - Type Aliases
typealias Base64URLString = String
typealias CredentialIDString = Base64URLString

// MARK: - Enums
enum class PublicKeyCredentialType(val value: String) : Enumerable {
    PUBLIC_KEY("public-key")
}

enum class PublicKeyCredentialAlgorithm(val value: Int) : Enumerable {
    ES256(-7)
}

enum class AuthenticatorTransport(val value: String) : Enumerable {
    USB("usb"),
    NFC("nfc"),
    BLE("ble"),
    HYBRID("hybrid");
}

enum class ResidentKeyPreference(val value: String) : Enumerable {
    DISCOURAGED("discouraged"),
    PREFERRED("preferred"),
    REQUIRED("required")
}

enum class UserVerificationPreference(val value: String) : Enumerable {
    DISCOURAGED("discouraged"),
    PREFERRED("preferred"),
    REQUIRED("required")
}

enum class AttestationConveyancePreference(val value: String) : Enumerable {
    DIRECT("direct"),
    ENTERPRISE("enterprise"),
    INDIRECT("indirect"),
    NONE("none")
}

// MARK: - Common Types
data class PublicKeyCredentialDescriptor(
    @Field
    val id: CredentialIDString,

    @Field
    val type: PublicKeyCredentialType = PublicKeyCredentialType.PUBLIC_KEY,

    @Field
    val transports: List<AuthenticatorTransport>? = null
) : Record

data class RelyingParty(
    @Field
    val id: String,

    @Field
    val name: String
) : Record

data class User(
    @Field
    val id: Base64URLString,

    @Field
    val name: String,

    @Field
    val displayName: String
) : Record