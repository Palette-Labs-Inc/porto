package expo.porto.p256

import expo.modules.kotlin.exception.CodedException

internal class NullKeyException :
  CodedException("P256 keys must not be null")

internal class WriteException(message: String?, key: String, keychain: String, cause: Throwable? = null) :
  CodedException("An error occurred when writing to key: '$key' under keychain: '$keychain'. Caused by: ${message ?: "unknown"}", cause)

internal class EncryptException(message: String?, key: String, keychain: String, cause: Throwable? = null) :
  CodedException("Could not encrypt the value for key '$key' under keychain '$keychain'. Caused by: ${message ?: "unknown"}", cause)

internal class DecryptException(message: String?, key: String, keychain: String, cause: Throwable? = null) :
  CodedException("Could not decrypt the value for key '$key' under keychain '$keychain'. Caused by: ${message ?: "unknown"}", cause)

internal class DeleteException(message: String?, key: String, keychain: String, cause: Throwable? = null) :
  CodedException("Could not delete the value for key '$key' under keychain '$keychain'. Caused by: ${message ?: "unknown"}", cause)

internal class AuthenticationException(message: String?, cause: Throwable? = null) :
  CodedException("Could not Authenticate the user: ${message ?: "unknown"}", cause)

internal class KeyStoreException(message: String?) :
  CodedException("An error occurred when accessing the keystore: ${message ?: "unknown"}")

internal class InvalidPublicKeyException(message: String? = null) :
  CodedException("The provided public key is invalid or not properly base64 encoded: ${message ?: "unknown"}")

internal class InvalidSignatureException(message: String? = null) :
  CodedException("The provided signature is invalid or not properly base64 encoded: ${message ?: "unknown"}")

internal class InvalidSigningPayloadException(message: String? = null) :
  CodedException("The provided payload is invalid or not properly base64 encoded: ${message ?: "unknown"}")
