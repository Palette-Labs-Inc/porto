package expo.modules.p256.encryptors

import expo.modules.p256.AuthenticationHelper
import expo.modules.p256.P256Options
import org.json.JSONException
import org.json.JSONObject
import java.security.GeneralSecurityException
import java.security.KeyStore

enum class KeyPurpose {
  ENCRYPT,
  DECRYPT
}
interface KeyBasedEncryptor<E : KeyStore.Entry> {
  fun getExtendedKeyStoreAlias(options: P256Options, requireAuthentication: Boolean): String

  fun getKeyStoreAlias(options: P256Options): String

  @Throws(GeneralSecurityException::class)
  fun initializeKeyStoreEntry(keyStore: KeyStore, options: P256Options): E

  @Throws(GeneralSecurityException::class, JSONException::class)
  suspend fun createEncryptedItem(
    plaintextValue: String,
    keyStoreEntry: E,
    requireAuthentication: Boolean,
    authenticationPrompt: String,
    authenticationHelper: AuthenticationHelper
  ): JSONObject

  @Throws(GeneralSecurityException::class, JSONException::class)
  suspend fun decryptItem(
    key: String,
    encryptedItem: JSONObject,
    keyStoreEntry: E,
    options: P256Options,
    authenticationHelper: AuthenticationHelper
  ): String
}
