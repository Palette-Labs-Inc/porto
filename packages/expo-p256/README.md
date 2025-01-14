
Provides a way to create and manage P256 key pairs using secure enclave on iOS and Android Keystore on Android.

# Installation in managed Expo projects

For [managed](https://docs.expo.dev/archive/managed-vs-bare/) Expo projects, please follow the installation instructions in the [API documentation for the latest stable release](https://docs.expo.dev/versions/latest/sdk/securestore/).

# Installation in bare React Native projects

For bare React Native projects, you must ensure that you have [installed and configured the `expo` package](https://docs.expo.dev/bare/installing-expo-modules/) before continuing.

### Add the package to your npm dependencies

```
npx expo install expo-p256
```

### Configure for Android

No additional set up necessary.

### Configure for iOS

Run `npx pod-install` after installing the npm package.

# Platform Implementation Details

## P256 Key Pair Generation
The implementation of P256 key pair generation differs between iOS and Android:

### iOS
On iOS, keys are generated in the Secure Enclave, and a reference to the key must be stored in the Keychain. This means:
- The private key is generated and stored in the Secure Enclave
- A reference to this key is stored in the Keychain
- You must maintain both the key in the Secure Enclave and its reference in the Keychain

### Android
On Android, keys are stored directly in the Android Keystore System using aliases. This means:
- The key pair is generated and stored directly in the KeyStore
- Keys are referenced directly by their alias
- No additional reference storage is needed

## Authentication Requirements
Authentication requirements for key operations are determined at key creation time and cannot be modified afterwards:

- When creating a key pair with `createP256KeyPair(key, { requireAuthentication: true })`, the authentication requirement is permanently bound to the key
- Subsequent operations like `signWithP256KeyPair` will require authentication based on how the key was created, regardless of the options passed to these methods
- This is a security feature that prevents bypassing authentication requirements after key creation
- On iOS, this is enforced by the Secure Enclave
- On Android, this is enforced by the KeyStore's `setUserAuthenticationRequired` flag

These implementation differences are handled automatically by the module, but they're important to understand when dealing with key lifecycle, storage behavior, and authentication requirements across platforms.

# Contributing

Contributions are very welcome! Please refer to guidelines described in the [contributing guide](https://github.com/expo/expo#contributing).
