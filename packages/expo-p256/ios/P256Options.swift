import ExpoModulesCore

internal struct P256Options: Record {
  @Field
  var authenticationPrompt: String?

  @Field
  var keychainAccessible: P256Accessible = .whenUnlocked

  @Field
  var keychainService: String?

  @Field
  var requireAuthentication: Bool
}
