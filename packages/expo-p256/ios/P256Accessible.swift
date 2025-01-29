import ExpoModulesCore

enum P256Accessible: Int, Enumerable {
  case afterFirstUnlock = 0
  case afterFirstUnlockThisDeviceOnly = 1
  case always = 2
  case whenPasscodeSetThisDeviceOnly = 3
  case alwaysThisDeviceOnly = 4
  case whenUnlocked = 5
  case whenUnlockedThisDeviceOnly = 6
}
