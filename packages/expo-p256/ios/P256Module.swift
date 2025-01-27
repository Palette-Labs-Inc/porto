import ExpoModulesCore
#if !os(tvOS)
import LocalAuthentication
#endif
import Security
import CryptoKit

public final class P256Module: Module {
  public func definition() -> ModuleDefinition {
    Name("ExpoP256")

    Constants([
      "AFTER_FIRST_UNLOCK": P256Accessible.afterFirstUnlock.rawValue,
      "AFTER_FIRST_UNLOCK_THIS_DEVICE_ONLY": P256Accessible.afterFirstUnlockThisDeviceOnly.rawValue,
      "ALWAYS": P256Accessible.always.rawValue,
      "WHEN_PASSCODE_SET_THIS_DEVICE_ONLY": P256Accessible.whenPasscodeSetThisDeviceOnly.rawValue,
      "ALWAYS_THIS_DEVICE_ONLY": P256Accessible.alwaysThisDeviceOnly.rawValue,
      "WHEN_UNLOCKED": P256Accessible.whenUnlocked.rawValue,
      "WHEN_UNLOCKED_THIS_DEVICE_ONLY": P256Accessible.whenUnlockedThisDeviceOnly.rawValue
    ])

    AsyncFunction("deleteValueWithKeyAsync") { (key: String, options: P256Options) in
      let noAuthSearchDictionary = query(with: key, options: options, requireAuthentication: false)
      let authSearchDictionary = query(with: key, options: options, requireAuthentication: true)
      let legacySearchDictionary = query(with: key, options: options)

      SecItemDelete(legacySearchDictionary as CFDictionary)
      SecItemDelete(authSearchDictionary as CFDictionary)
      SecItemDelete(noAuthSearchDictionary as CFDictionary)
    }

    Function("canUseBiometricAuthentication") {() -> Bool in
      #if os(tvOS)
      return false
      #else
      let context = LAContext()
      var error: NSError?
      let isBiometricsSupported: Bool = context.canEvaluatePolicy(LAPolicy.deviceOwnerAuthenticationWithBiometrics, error: &error)

      if error != nil {
        return false
      }
      return isBiometricsSupported
      #endif
    }

    AsyncFunction("createP256KeyPair") { (key: String, options: P256Options) -> [String: String] in
      guard let key = validate(for: key) else {
        throw InvalidKeyException()
      }

      var error: Unmanaged<CFError>?
      let flags: SecAccessControlCreateFlags = options.requireAuthentication
        ? [.userPresence, .privateKeyUsage]
        : .privateKeyUsage

      guard let accessControl = SecAccessControlCreateWithFlags(
        kCFAllocatorDefault,
        attributeWith(options: options),
        flags,
        &error
      ) else {
        let errorCode = error.map { CFErrorGetCode($0.takeRetainedValue()) }
        throw SecAccessControlError(errorCode)
      }

      // Create private key with access control
      let privateKey = try SecureEnclave.P256.Signing.PrivateKey(
        accessControl: accessControl
      )
      
      // Store private key bytes WITHOUT authentication requirement. If true, we would require double signing which is poor UX.
      let noAuthOptions: P256Options = options
      noAuthOptions.requireAuthentication = false
      
      let privateKeyData = privateKey.dataRepresentation
    
      // Store private key and check result
      let setResult = try set(value: privateKeyData.base64EncodedString(), with: key, options: noAuthOptions)
      if !setResult {
        throw KeyChainException(errSecDuplicateItem)
      }
        
      let result = [
        "publicKey": privateKey.publicKey.rawRepresentation.base64EncodedString()
      ]
      
      return result
    }

    AsyncFunction("getP256KeyPair") { (key: String, options: P256Options) -> [String: String]? in
      guard let key = validate(for: key) else {
        throw InvalidKeyException()
      }

      // Get stored private key
      if let base64PrivateKey = try get(with: key, options: options) {
        guard let privateKeyData = Data(base64Encoded: base64PrivateKey),
              let privateKey = try? SecureEnclave.P256.Signing.PrivateKey(dataRepresentation: privateKeyData) else {
          return nil
        }
        
        return [
          "publicKey": privateKey.publicKey.rawRepresentation.base64EncodedString()
        ]
      }
      
      return nil
    }

    AsyncFunction("signWithP256KeyPair") { (key: String, payload: String, options: P256Options) -> [String: String]? in
      guard let key = validate(for: key) else {
        throw InvalidKeyException()
      }

      // Get stored private key
      if let base64PrivateKey = try get(with: key, options: options) {
        guard let privateKeyData = Data(base64Encoded: base64PrivateKey),
              let privateKey = try? SecureEnclave.P256.Signing.PrivateKey(dataRepresentation: privateKeyData) else {
          throw InvalidKeyException()
        }
        
        // Convert payload to Data
        guard let payloadData: Data = Data(base64Encoded: payload) else {
          throw InvalidSigningPayloadException()
        }
          
        let signature: P256.Signing.ECDSASignature
        do {
          signature = try privateKey.signature(for: payloadData)
        } catch {
          throw SigningOperationException(error.localizedDescription)
        }
        
        return [
          "signature": signature.derRepresentation.base64EncodedString(),
          "publicKey": privateKey.publicKey.derRepresentation.base64EncodedString()
        ]
      }
      
      return nil
    }

    AsyncFunction("verifyP256Signature") { (key: String, signature: String, payload: String, options: P256Options) -> Bool in
      guard let key = validate(for: key) else {
        throw InvalidKeyException()
      }
      
      // Get stored private key
      if let base64PrivateKey = try get(with: key, options: options) {
        guard let privateKeyData = Data(base64Encoded: base64PrivateKey),
              let privateKey = try? SecureEnclave.P256.Signing.PrivateKey(dataRepresentation: privateKeyData) else {
          throw InvalidKeyException()
        }
        
        // Get public key from private key
        let publicKey = privateKey.publicKey
        
        // Convert base64 strings to Data with specific error handling
        guard let signatureData = Data(base64Encoded: signature) else {
          throw InvalidSignatureException()
        }
        
        guard let payloadData = Data(base64Encoded: payload) else {
          throw InvalidPayloadException()
        }
        
        do {
          // Create P256.Signing.ECDSASignature from DER representation
          let ecdsaSignature = try P256.Signing.ECDSASignature(derRepresentation: signatureData)
          
          // Verify the signature
          return publicKey.isValidSignature(ecdsaSignature, for: payloadData)
        } catch {
          throw InvalidSignatureException()
        }
      }
      
      return false
    }
  }

  private func get(with key: String, options: P256Options) throws -> String? {
    guard let key = validate(for: key) else {
      throw InvalidKeyException()
    }

    if let unauthenticatedItem = try searchKeyChain(with: key, options: options, requireAuthentication: false) {
      return String(data: unauthenticatedItem, encoding: .utf8)
    }

    if let authenticatedItem = try searchKeyChain(with: key, options: options, requireAuthentication: true) {
      return String(data: authenticatedItem, encoding: .utf8)
    }

    if let legacyItem = try searchKeyChain(with: key, options: options) {
      return String(data: legacyItem, encoding: .utf8)
    }

    return nil
  }

  private func set(value: String, with key: String, options: P256Options) throws -> Bool {
    var setItemQuery = query(with: key, options: options, requireAuthentication: options.requireAuthentication)

    let valueData = value.data(using: .utf8)
    setItemQuery[kSecValueData as String] = valueData

    let accessibility = attributeWith(options: options)

    if !options.requireAuthentication {
      setItemQuery[kSecAttrAccessible as String] = accessibility
    } else {
      guard let _ = Bundle.main.infoDictionary?["NSFaceIDUsageDescription"] as? String else {
        throw MissingPlistKeyException()
      }

      var error: Unmanaged<CFError>? = nil
      guard let accessOptions = SecAccessControlCreateWithFlags(kCFAllocatorDefault, accessibility, .biometryCurrentSet, &error) else {
        let errorCode = error.map { CFErrorGetCode($0.takeRetainedValue()) }
        throw SecAccessControlError(errorCode)
      }
      setItemQuery[kSecAttrAccessControl as String] = accessOptions
    }

    let status = SecItemAdd(setItemQuery as CFDictionary, nil)

    switch status {
    case errSecSuccess:
      // On success we want to remove the other key alias and legacy key (if they exist) to avoid conflicts during reads
      SecItemDelete(query(with: key, options: options) as CFDictionary)
      SecItemDelete(query(with: key, options: options, requireAuthentication: !options.requireAuthentication) as CFDictionary)
      return true
    case errSecDuplicateItem:
      return try update(value: value, with: key, options: options)
    default:
      throw KeyChainException(status)
    }
  }

  private func update(value: String, with key: String, options: P256Options) throws -> Bool {
    var query = query(with: key, options: options, requireAuthentication: options.requireAuthentication)

    let valueData = value.data(using: .utf8)
    let updateDictionary = [kSecValueData as String: valueData]

    if let authPrompt = options.authenticationPrompt {
      query[kSecUseOperationPrompt as String] = authPrompt
    }

    let status = SecItemUpdate(query as CFDictionary, updateDictionary as CFDictionary)

    if status == errSecSuccess {
      return true
    } else {
      throw KeyChainException(status)
    }
  }

  private func searchKeyChain(with key: String, options: P256Options, requireAuthentication: Bool? = nil) throws -> Data? {
    var query = query(with: key, options: options, requireAuthentication: requireAuthentication)

    query[kSecMatchLimit as String] = kSecMatchLimitOne
    query[kSecReturnData as String] = kCFBooleanTrue

    if let authPrompt = options.authenticationPrompt {
      query[kSecUseOperationPrompt as String] = authPrompt
    }

    var item: CFTypeRef?
    let status = SecItemCopyMatching(query as CFDictionary, &item)

    switch status {
    case errSecSuccess:
      guard let item = item as? Data else {
        return nil
      }
      return item
    case errSecItemNotFound:
      return nil
    default:
      throw KeyChainException(status)
    }
  }

  private func query(with key: String, options: P256Options, requireAuthentication: Bool? = nil) -> [String: Any] {
    var service = options.keychainService ?? "app"
    if let requireAuthentication {
      service.append(":\(requireAuthentication ? "auth" : "no-auth")")
    }

    let encodedKey = Data(key.utf8)

    return [
      kSecClass as String: kSecClassGenericPassword,
      kSecAttrService as String: service,
      kSecAttrGeneric as String: encodedKey,
      kSecAttrAccount as String: encodedKey
    ]
  }

  private func attributeWith(options: P256Options) -> CFString {
    switch options.keychainAccessible {
    case .afterFirstUnlock:
      return kSecAttrAccessibleAfterFirstUnlock
    case .afterFirstUnlockThisDeviceOnly:
      return kSecAttrAccessibleAfterFirstUnlockThisDeviceOnly
    case .always:
      return kSecAttrAccessibleAlways
    case .whenPasscodeSetThisDeviceOnly:
      return kSecAttrAccessibleWhenPasscodeSetThisDeviceOnly
    case .whenUnlocked:
      return kSecAttrAccessibleWhenUnlocked
    case .alwaysThisDeviceOnly:
      return kSecAttrAccessibleAlwaysThisDeviceOnly
    case .whenUnlockedThisDeviceOnly:
      return kSecAttrAccessibleWhenUnlockedThisDeviceOnly
    }
  }

  private func validate(for key: String) -> String? {
    let trimmedKey = key.trimmingCharacters(in: .whitespaces)
    if trimmedKey.isEmpty {
      return nil
    }
    return key
  }
}
