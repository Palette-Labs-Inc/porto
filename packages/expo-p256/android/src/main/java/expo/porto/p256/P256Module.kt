package expo.porto.p256

/**
 * P256Module handles P-256 (secp256r1) key pair generation, storage, and signing operations.
 * 
 * Key Format Handling:
 * 1. Android KeyStore returns public keys in X.509/DER format (91 bytes)
 * 2. We convert this to raw format (65 bytes) for compatibility with ox library:
 *    - 1 byte: prefix (0x04 for uncompressed)
 *    - 32 bytes: X coordinate
 *    - 32 bytes: Y coordinate
 * 
 * The conversion process:
 * 1. Get key from KeyStore in DER format
 * 2. Find 0x04 prefix in DER structure (indicates uncompressed point format)
 * 3. Extract 65 bytes starting from prefix
 * 4. Base64 encode for transport
 * 
 * This ensures the public key format matches what ox's PublicKey.from() expects:
 * - Uncompressed format (65 bytes): prefix (0x04) + x-coord (32 bytes) + y-coord (32 bytes)
 * - Compressed format (33 bytes): prefix (0x02/0x03) + x-coord (32 bytes)
 */

import android.content.Context
import android.content.SharedPreferences
import android.os.Build
import android.preference.PreferenceManager
import android.security.keystore.KeyPermanentlyInvalidatedException
import android.security.keystore.KeyProperties
import android.util.Log
import android.util.Base64
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.exception.Exceptions
import expo.modules.kotlin.functions.Coroutine
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.porto.p256.encryptors.AESEncryptor
import expo.porto.p256.encryptors.HybridAESEncryptor
import expo.porto.p256.encryptors.KeyBasedEncryptor
import org.json.JSONException
import org.json.JSONObject
import java.security.*
import java.security.KeyStore
import java.security.KeyStore.PrivateKeyEntry
import java.security.KeyStore.SecretKeyEntry
import java.security.spec.ECGenParameterSpec
import android.security.keystore.KeyGenParameterSpec
import javax.crypto.BadPaddingException
import android.security.keystore.UserNotAuthenticatedException
import android.security.keystore.KeyInfo
import androidx.annotation.RequiresApi

open class P256Module : Module() {
  private val mAESEncryptor = AESEncryptor()
  open val reactContext: Context
    get() = appContext.reactContext ?: throw Exceptions.ReactContextLost()

  private lateinit var keyStore: KeyStore
  private lateinit var hybridAESEncryptor: HybridAESEncryptor
  private lateinit var authenticationHelper: AuthenticationHelper

  @RequiresApi(Build.VERSION_CODES.R)
  override fun definition() = ModuleDefinition {
    Name("ExpoP256")

    AsyncFunction("deleteValueWithKeyAsync") { key: String, options: P256Options ->
      try {
        deleteItemImpl(key, options)
      } catch (e: CodedException) {
        throw e
      } catch (e: Exception) {
        throw DeleteException(e.message, key, options.keychainService, e)
      }
    }

    Function("canUseBiometricAuthentication") {
      return@Function try {
        authenticationHelper.assertBiometricsSupport()
        true
      } catch (e: AuthenticationException) {
        false
      }
    }

    AsyncFunction("createP256KeyPair") Coroutine { key: String, options: P256Options ->
      key ?: throw NullKeyException()
      
      try {
        // Check biometrics support if authentication is required
        if (options.requireAuthentication) {
          authenticationHelper.assertBiometricsSupport()
        }

        val alias = "${options.keychainService}-$key"
        val keyPair = createP256KeyPair(alias, options.requireAuthentication)
        
        // Convert DER to raw format
        val rawPublicKey = extractRawPublicKeyFromDER(keyPair.public.encoded)
        
        val result = mapOf(
          "publicKey" to Base64.encodeToString(rawPublicKey, Base64.NO_WRAP)
        )
        
        return@Coroutine result
      } catch (e: Exception) {
        throw EncryptException("Failed to generate P256 key pair: ${e.message}", key, options.keychainService, e)
      }
    }

    AsyncFunction("getP256KeyPair") Coroutine { key: String, options: P256Options ->
      try {
        val alias = "${options.keychainService}-$key"
        val keyPair = getP256KeyPairFromKeystore(alias) ?: return@Coroutine null
        
        // Convert DER to raw format
        val rawPublicKey = extractRawPublicKeyFromDER(keyPair.public.encoded)
        
        val result = mapOf(
          "publicKey" to Base64.encodeToString(rawPublicKey, Base64.NO_WRAP)
        )
        
        return@Coroutine result
      } catch (e: Exception) {
        throw DecryptException("Failed to retrieve P256 key pair: ${e.message}", key, options.keychainService, e)
      }
    }

    AsyncFunction("signWithP256KeyPair") Coroutine { key: String, payload: String, options: P256Options ->
      try {
        val alias = "${options.keychainService}-$key"
        Log.d(TAG, "Attempting to sign with key alias: $alias")
        
        val keyPair = getP256KeyPairFromKeystore(alias)
          ?: throw DecryptException("Key not found in Keystore", key, options.keychainService)
        Log.d(TAG, "Successfully retrieved key pair from keystore")
        
        // Get the private key entry directly
        val keyEntry = keyStore.getEntry(alias, null) as PrivateKeyEntry
        Log.d(TAG, "Retrieved KeyStore entry type: ${keyEntry::class.java.simpleName}")
        
        // Get the private key
        val privateKey = keyEntry.privateKey
        Log.d(TAG, "Private key class: ${privateKey::class.java.simpleName}")
        Log.d(TAG, "Private key algorithm: ${privateKey.algorithm}")
        
        // Create KeyFactory and get KeyInfo without casting the private key
        val keyFactory = KeyFactory.getInstance(privateKey.algorithm, KEYSTORE_PROVIDER)
        val keySpec = keyFactory.getKeySpec(privateKey, KeyInfo::class.java)
        
        Log.d(TAG, "Key authentication required: ${keySpec.isUserAuthenticationRequired}")
        Log.d(TAG, "Key authentication validity duration: ${keySpec.userAuthenticationValidityDurationSeconds}")
        Log.d(TAG, "Key inside secure hardware: ${keySpec.isInsideSecureHardware}")
        
        // Create signature object
        val signature = Signature.getInstance("SHA256withECDSA")
        Log.d(TAG, "Created signature instance with algorithm: SHA256withECDSA")
        
        // Only use authenticateSignature if the key requires authentication
        val signatureBytes = if (keySpec.isUserAuthenticationRequired) {
          Log.d(TAG, "Key requires authentication, prompting user...")
          authenticationHelper.authenticateSignature(
            signature.apply { 
              initSign(privateKey)
              update(Base64.decode(payload, Base64.NO_WRAP))
            },
            true,
            options.authenticationPrompt ?: "Authenticate to sign"
          ).sign()
        } else {
          Log.d(TAG, "Key does not require authentication, signing directly...")
          signature.apply {
            initSign(privateKey)
            update(Base64.decode(payload, Base64.NO_WRAP))
          }.sign()
        }
        
        Log.d(TAG, "Successfully generated signature")
        
        val result = mapOf(
          "signature" to Base64.encodeToString(signatureBytes, Base64.NO_WRAP),
          "publicKey" to Base64.encodeToString(keyPair.public.encoded, Base64.NO_WRAP)
        )
        Log.d(TAG, "Returning signature result with length: ${signatureBytes.size}")
        
        return@Coroutine result
      } catch (e: KeyPermanentlyInvalidatedException) {
        Log.e(TAG, "Key has been permanently invalidated", e)
        throw DecryptException("Key has been permanently invalidated", key, options.keychainService, e)
      } catch (e: UserNotAuthenticatedException) {
        Log.e(TAG, "User authentication required but not provided", e)
        throw AuthenticationException("User authentication required", e)
      } catch (e: Exception) {
        Log.e(TAG, "Failed to sign with P256 key pair", e)
        throw DecryptException("Failed to sign with P256 key pair: ${e.message}", key, options.keychainService, e)
      }
    }

    AsyncFunction("verifyP256Signature") Coroutine { key: String, signature: String, payload: String, options: P256Options ->
      try {
        val alias = "${options.keychainService}-$key"
        val keyPair = getP256KeyPairFromKeystore(alias)
          ?: throw DecryptException("Key not found in Keystore", key, options.keychainService)
        
        // Verify signature using public key from keystore
        return@Coroutine Signature.getInstance("SHA256withECDSA").run {
          initVerify(keyPair.public)
          update(Base64.decode(payload, Base64.NO_WRAP))
          verify(Base64.decode(signature, Base64.NO_WRAP))
        }
      } catch (e: Exception) {
        throw DecryptException("Failed to verify P256 signature", "verify", options.keychainService, e)
      }
    }

    OnCreate {
      authenticationHelper = AuthenticationHelper(reactContext, appContext.legacyModuleRegistry)
      hybridAESEncryptor = HybridAESEncryptor(reactContext, mAESEncryptor)

      val keyStore = KeyStore.getInstance(KEYSTORE_PROVIDER)
      keyStore.load(null)
      this@P256Module.keyStore = keyStore
    }
  }

  private suspend fun getItemImpl(key: String, options: P256Options): String? {
    // We use a P256-specific shared preferences file, which lets us do things like enumerate
    // its entries or clear all of them
    val prefs: SharedPreferences = getSharedPreferences()
    val keychainAwareKey = createKeychainAwareKey(key, options.keychainService)
    if (prefs.contains(keychainAwareKey)) {
      return readJSONEncodedItem(key, prefs, options)
    } else if (prefs.contains(key)) { // For backwards-compatibility try to read using the old key format
      return readJSONEncodedItem(key, prefs, options)
    }
    return null
  }

  private suspend fun readJSONEncodedItem(key: String, prefs: SharedPreferences, options: P256Options): String? {
    val keychainAwareKey = createKeychainAwareKey(key, options.keychainService)

    val legacyEncryptedItemString = prefs.getString(key, null)
    val currentEncryptedItemString = prefs.getString(keychainAwareKey, null)
    val encryptedItemString = currentEncryptedItemString ?: legacyEncryptedItemString

    // It's not possible to efficiently remove all values from older versions of secure-store when an invalidated keychain is deleted.
    // In some edge cases it will lead to read errors until the value is removed from the shared preferences
    val legacyReadFailedWarning = if (currentEncryptedItemString == null) {
      ". This exception occurred when trying to read a value saved with an " +
        "older version of `expo-p256`. It usually means that the keychain you provided is incorrect, " +
        "but it might be raised because the keychain used to decrypt this key has been invalidated and deleted." +
        " If you are confident that the keychain you provided is correct and want to avoid this error in the " +
        "future you should save a new value under this key or use `deleteItemImpl()` and remove the existing one."
    } else {
      ""
    }

    encryptedItemString ?: return null

    val encryptedItem: JSONObject = try {
      JSONObject(encryptedItemString)
    } catch (e: JSONException) {
      throw DecryptException("Could not parse the encrypted JSON item in P256: ${e.message}", key, options.keychainService, e)
    }

    val scheme = encryptedItem.optString(SCHEME_PROPERTY).takeIf { it.isNotEmpty() }
      ?: throw DecryptException("Could not find the encryption scheme used for key: $key", key, options.keychainService)
    val requireAuthentication = encryptedItem.optBoolean(AuthenticationHelper.REQUIRE_AUTHENTICATION_PROPERTY, false)
    val usesKeystoreSuffix = encryptedItem.optBoolean(USES_KEYSTORE_SUFFIX_PROPERTY, false)

    try {
      when (scheme) {
        AESEncryptor.NAME -> {
          val secretKeyEntry = getKeyEntryCompat(SecretKeyEntry::class.java, mAESEncryptor, options, requireAuthentication, usesKeystoreSuffix) ?: run {
            Log.w(
              TAG,
              "An entry was found for key $key under keychain ${options.keychainService}, but there is no corresponding KeyStore key. " +
                "This situation occurs when the app is reinstalled. The value will be removed to avoid future errors. Returning null"
            )
            deleteItemImpl(key, options)
            return null
          }
          return mAESEncryptor.decryptItem(key, encryptedItem, secretKeyEntry, options, authenticationHelper)
        }
        HybridAESEncryptor.NAME -> {
          val privateKeyEntry = getKeyEntryCompat(PrivateKeyEntry::class.java, hybridAESEncryptor, options, requireAuthentication, usesKeystoreSuffix)
            ?: return null
          return hybridAESEncryptor.decryptItem(key, encryptedItem, privateKeyEntry, options, authenticationHelper)
        }
        else -> {
          throw DecryptException("The item for key $key in P256 has an unknown encoding scheme $scheme)", key, options.keychainService)
        }
      }
    } catch (e: KeyPermanentlyInvalidatedException) {
      Log.w(TAG, "The requested key has been permanently invalidated. Returning null")
      return null
    } catch (e: BadPaddingException) {
      // The key from the KeyStore is unable to decode the entry. This is because a new key was generated, but the entries are encrypted using the old one.
      // This usually means that the user has reinstalled the app. We can safely remove the old value and return null as it's impossible to decrypt it.
      Log.w(
        TAG,
        "Failed to decrypt the entry for $key under keychain ${options.keychainService}. " +
          "The entry in shared preferences is out of sync with the keystore. It will be removed, returning null."
      )
      deleteItemImpl(key, options)
      return null
    } catch (e: GeneralSecurityException) {
      throw (DecryptException(e.message, key, options.keychainService, e))
    } catch (e: CodedException) {
      throw e
    } catch (e: Exception) {
      throw (DecryptException(e.message, key, options.keychainService, e))
    }
  }

  private suspend fun setItemImpl(key: String, value: String?, options: P256Options, keyIsInvalidated: Boolean) {
    val keychainAwareKey = createKeychainAwareKey(key, options.keychainService)
    val prefs: SharedPreferences = getSharedPreferences()

    if (value == null) {
      val success = prefs.edit().putString(keychainAwareKey, null).commit()
      if (!success) {
        throw WriteException("Could not write a null value to P256", key, options.keychainService)
      }
      return
    }

    try {
      if (keyIsInvalidated) {
        // Invalidated keys will block writing even though it's not possible to re-validate them
        // so we remove them before saving.
        val alias = mAESEncryptor.getExtendedKeyStoreAlias(options, options.requireAuthentication)
        removeKeyFromKeystore(alias, options.keychainService)
      }

      /* Android API 23+ supports storing symmetric keys in the keystore and on older Android
       versions we store an asymmetric key pair and use hybrid encryption. We store the scheme we
       use in the encrypted JSON item so that we know how to decode and decrypt it when reading
       back a value.
       */
      val secretKeyEntry: SecretKeyEntry = getOrCreateKeyEntry(SecretKeyEntry::class.java, mAESEncryptor, options, options.requireAuthentication)
      val encryptedItem = mAESEncryptor.createEncryptedItem(value, secretKeyEntry, options.requireAuthentication, options.authenticationPrompt, authenticationHelper)
      encryptedItem.put(SCHEME_PROPERTY, AESEncryptor.NAME)
      saveEncryptedItem(encryptedItem, prefs, keychainAwareKey, options.requireAuthentication, options.keychainService)

      // If a legacy value exists under this key we remove it to avoid unexpected errors in the future
      if (prefs.contains(key)) {
        prefs.edit().remove(key).apply()
      }
    } catch (e: KeyPermanentlyInvalidatedException) {
      if (!keyIsInvalidated) {
        Log.w(TAG, "Key has been invalidated, retrying with the key deleted")
        return setItemImpl(key, value, options, true)
      }
      throw EncryptException("Encryption Failed. The key $key has been permanently invalidated and cannot be reinitialized", key, options.keychainService, e)
    } catch (e: GeneralSecurityException) {
      throw EncryptException(e.message, key, options.keychainService, e)
    } catch (e: CodedException) {
      throw e
    } catch (e: Exception) {
      throw WriteException(e.message, key, options.keychainService, e)
    }
  }

  private fun saveEncryptedItem(encryptedItem: JSONObject, prefs: SharedPreferences, key: String, requireAuthentication: Boolean, keychainService: String): Boolean {
    // We need a way to recognize entries that have been saved under an alias created with getExtendedKeychain
    encryptedItem.put(USES_KEYSTORE_SUFFIX_PROPERTY, true)
    // In order to be able to have the same keys under different keychains
    // we need a way to recognize what is the keychain of the item when we read it
    encryptedItem.put(KEYSTORE_ALIAS_PROPERTY, keychainService)
    encryptedItem.put(AuthenticationHelper.REQUIRE_AUTHENTICATION_PROPERTY, requireAuthentication)

    val encryptedItemString = encryptedItem.toString()
    if (encryptedItemString.isEmpty()) { // JSONObject#toString() may return null
      throw WriteException("Could not JSON-encode the encrypted item for P256 - the string $encryptedItemString is null or empty", key, keychainService)
    }

    return prefs.edit().putString(key, encryptedItemString).commit()
  }

  private fun deleteItemImpl(key: String, options: P256Options) {
    var success = true
    val prefs = getSharedPreferences()
    val keychainAwareKey = createKeychainAwareKey(key, options.keychainService)
    val legacyPrefs = PreferenceManager.getDefaultSharedPreferences(reactContext)

    if (prefs.contains(keychainAwareKey)) {
      success = prefs.edit().remove(keychainAwareKey).commit()
    }

    if (prefs.contains(key)) {
      success = prefs.edit().remove(key).commit() && success
    }

    if (legacyPrefs.contains(key)) {
      success = legacyPrefs.edit().remove(key).commit() && success
    }

    if (!success) {
      throw DeleteException("Could not delete the item from P256", key, options.keychainService)
    }
  }

  private fun removeKeyFromKeystore(keyStoreAlias: String, keychainService: String) {
    keyStore.deleteEntry(keyStoreAlias)
    removeAllEntriesUnderKeychainService(keychainService)
  }

  private fun removeAllEntriesUnderKeychainService(keychainService: String) {
    val sharedPreferences = getSharedPreferences()
    val allEntries: Map<String, *> = sharedPreferences.all

    // In order to avoid decryption failures we need to remove all entries that are using the deleted encryption key
    for ((key: String, value) in allEntries) {
      val valueString = value as? String ?: continue
      val jsonEntry = try {
        JSONObject(valueString)
      } catch (e: JSONException) {
        continue
      }

      val entryKeychainService = jsonEntry.optString(KEYSTORE_ALIAS_PROPERTY) ?: continue
      val requireAuthentication = jsonEntry.optBoolean(AuthenticationHelper.REQUIRE_AUTHENTICATION_PROPERTY, false)

      // Entries which don't require authentication use separate keychains which can't be invalidated,
      // so we shouldn't delete them.
      if (requireAuthentication && keychainService == entryKeychainService) {
        sharedPreferences.edit().remove(key).apply()
        Log.w(TAG, "Removing entry: $key due to the encryption key being deleted")
      }
    }
  }

  /**
   * Each key is stored under a keychain service that requires authentication, or one that doesn't
   * Keys used to be stored under a single keychain, which led to different behaviour on iOS and Android.
   * Because of that we need to check if there are any keys stored with the old secure-store key format.
   */
  private fun <E : KeyStore.Entry> getLegacyKeyEntry(
    keyStoreEntryClass: Class<E>,
    encryptor: KeyBasedEncryptor<E>,
    options: P256Options
  ): E? {
    val keystoreAlias = encryptor.getKeyStoreAlias(options)
    if (!keyStore.containsAlias(encryptor.getKeyStoreAlias(options))) {
      return null
    }

    val entry = keyStore.getEntry(keystoreAlias, null)
    if (!keyStoreEntryClass.isInstance(entry)) {
      return null
    }
    return keyStoreEntryClass.cast(entry)
  }

  private fun <E : KeyStore.Entry> getKeyEntry(
    keyStoreEntryClass: Class<E>,
    encryptor: KeyBasedEncryptor<E>,
    options: P256Options,
    requireAuthentication: Boolean
  ): E? {
    val keystoreAlias = encryptor.getExtendedKeyStoreAlias(options, requireAuthentication)
    return if (keyStore.containsAlias(keystoreAlias)) {
      val entry = keyStore.getEntry(keystoreAlias, null)
      if (!keyStoreEntryClass.isInstance(entry)) {
        throw KeyStoreException("The entry for the keystore alias \"$keystoreAlias\" is not a ${keyStoreEntryClass.simpleName}")
      }
      keyStoreEntryClass.cast(entry)
        ?: throw KeyStoreException("The entry for the keystore alias \"$keystoreAlias\" couldn't be cast to correct class")
    } else {
      null
    }
  }

  private fun <E : KeyStore.Entry> getOrCreateKeyEntry(
    keyStoreEntryClass: Class<E>,
    encryptor: KeyBasedEncryptor<E>,
    options: P256Options,
    requireAuthentication: Boolean
  ): E {
    return getKeyEntry(keyStoreEntryClass, encryptor, options, requireAuthentication) ?: run {
      // Android won't allow us to generate the keys if the device doesn't support biometrics or no biometrics are enrolled
      if (requireAuthentication) {
        authenticationHelper.assertBiometricsSupport()
      }
      encryptor.initializeKeyStoreEntry(keyStore, options)
    }
  }

  private fun <E : KeyStore.Entry> getKeyEntryCompat(
    keyStoreEntryClass: Class<E>,
    encryptor: KeyBasedEncryptor<E>,
    options: P256Options,
    requireAuthentication: Boolean,
    usesKeystoreSuffix: Boolean
  ): E? {
    return if (usesKeystoreSuffix) {
      getKeyEntry(keyStoreEntryClass, encryptor, options, requireAuthentication)
    } else {
      getLegacyKeyEntry(keyStoreEntryClass, encryptor, options)
    }
  }

  private fun getSharedPreferences(): SharedPreferences {
    return reactContext.getSharedPreferences(SHARED_PREFERENCES_NAME, Context.MODE_PRIVATE)
  }

  /**
   * Adds the keychain service as a prefix to the key in order to avoid conflicts in shared preferences
   * when there are two identical keys but saved with different keychains.
   */
  private fun createKeychainAwareKey(key: String, keychainService: String): String {
    return "$keychainService-$key"
  }

  @RequiresApi(Build.VERSION_CODES.R)
  private fun createP256KeyPair(alias: String, requireAuthentication: Boolean): KeyPair {
    Log.d(TAG, "Creating P256 key pair for alias: $alias, requireAuthentication: $requireAuthentication")
    
    val params = KeyGenParameterSpec.Builder(
      alias,
      KeyProperties.PURPOSE_SIGN or KeyProperties.PURPOSE_VERIFY
    )
      .setAlgorithmParameterSpec(ECGenParameterSpec("secp256r1"))
      .setDigests(KeyProperties.DIGEST_SHA256)
      
    if (requireAuthentication) {
      Log.d(TAG, "Configuring key pair with biometric authentication")
      params
        .setUserAuthenticationRequired(true)
        .setUserAuthenticationParameters(0, KeyProperties.AUTH_BIOMETRIC_STRONG)
        .setInvalidatedByBiometricEnrollment(true)
    } else {
      Log.d(TAG, "Configuring key pair without authentication")
      params.setUserAuthenticationRequired(false)
    }

    val generator = params.build()
    Log.d(TAG, "Initializing key pair generator with EC algorithm")
    
    val keyPairGenerator = KeyPairGenerator.getInstance(
      KeyProperties.KEY_ALGORITHM_EC,
      KEYSTORE_PROVIDER
    )
    keyPairGenerator.initialize(generator)
    
    val keyPair = keyPairGenerator.generateKeyPair()
    Log.d(TAG, "Successfully generated P256 key pair")
    val publicKey = keyPair.public
    
    return keyPair
  }

  private fun getP256KeyPairFromKeystore(alias: String): KeyPair? {
    val ks = KeyStore.getInstance(KEYSTORE_PROVIDER).apply { load(null) }
    if (!ks.containsAlias(alias)) {
      return null
    }
    val entry = ks.getEntry(alias, null) as? KeyStore.PrivateKeyEntry
      ?: throw KeyStoreException("Bad format for private key")
      
    return KeyPair(entry.certificate.publicKey, entry.privateKey)
  }

  /**
   * Extracts the raw public key format from X.509/DER format.
   * The ox library's PublicKey.from() expects:
   * - Raw uncompressed format (65 bytes): 0x04 + x-coord (32 bytes) + y-coord (32 bytes)
   * - Raw compressed format (33 bytes): (0x02 or 0x03) + x-coord (32 bytes)
   * 
   * @param derBytes The DER encoded public key bytes from Android KeyStore
   * @return Raw format public key bytes (65 bytes for uncompressed)
   * @throws InvalidKeyException if the 0x04 prefix cannot be found
   */
  private fun extractRawPublicKeyFromDER(derBytes: ByteArray): ByteArray {
    // Find the 0x04 prefix that indicates uncompressed point format
    val keyIndex = derBytes.indexOfFirst { it == 0x04.toByte() }
    if (keyIndex != -1) {
      // Extract 65 bytes (0x04 + 32 bytes X + 32 bytes Y)
      return derBytes.slice(keyIndex until keyIndex + 65).toByteArray()
    } else {
      throw InvalidKeyException()
    }
  }

  companion object {
    private const val SHARED_PREFERENCES_NAME = "P256"
    const val USES_KEYSTORE_SUFFIX_PROPERTY = "usesKeystoreSuffix"
    const val DEFAULT_KEYSTORE_ALIAS = "porto"
    const val TAG = "PortoP256"
    const val KEYSTORE_PROVIDER = "AndroidKeyStore"
    const val AUTHENTICATED_KEYSTORE_SUFFIX = "keystoreAuthenticated"
    const val UNAUTHENTICATED_KEYSTORE_SUFFIX = "keystoreUnauthenticated"
    private const val SCHEME_PROPERTY = "scheme"
    private const val KEYSTORE_ALIAS_PROPERTY = "keystoreAlias"
  }
}
