package expo.modules.p256

import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.Serializable

class P256Options(
  // Prompt can't be an empty string
  @Field var authenticationPrompt: String = "",
  @Field var keychainService: String = P256Module.DEFAULT_KEYSTORE_ALIAS,
  @Field var requireAuthentication: Boolean = false,
) : Record, Serializable
