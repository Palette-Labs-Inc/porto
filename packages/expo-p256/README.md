# @porto/expo-p256

Native P256 implementation for Expo applications using secure hardware (iOS Secure Enclave, Android Keystore).

## Overview

This module provides NIST P256 ECDSA operations using platform-specific secure hardware:
- iOS: Secure Enclave for key generation and operations
- Android: Android Keystore System for key storage and operations

## Installation

```sh
pnpm install @porto/expo-p256
```

### iOS Setup
Run `npx pod-install` after installing the npm package.

### Android Setup
No additional setup required.

## Examples

### Creating Key Pairs

```ts
import * as P256 from '@porto/expo-p256'

// Create a new key pair with biometric protection
const key = await P256.createKeyPair({
  requireAuthentication: true,
  authenticationPrompt: "Create your Porto key"
})

// The key object contains:
type P256Key = {
  publicKey: PublicKey      // P256 public key
  privateKeyStorageKey: string  // Reference to secure storage
}
```

### Signing Payloads

```ts
import * as P256 from '@porto/expo-p256'

// Sign a payload
const signature = await P256.sign({ 
  privateKeyStorageKey: key.privateKeyStorageKey,
  payload: '0xdeadbeef',
  authenticationPrompt: "Sign transaction"
})
```

### Verifying Signatures

```ts
import * as P256 from '@porto/expo-p256'

const verified = await P256.verify({ 
  publicKey: key.publicKey,
  signature: signature,
  payload: '0xdeadbeef'
})
```

## Platform Implementation Details

### P256 Key Pair Generation

#### iOS
- Private key is generated and stored in the Secure Enclave
- Reference to the key is stored in the Keychain
- Authentication requirements are enforced by Secure Enclave
- Requires maintaining both Secure Enclave key and Keychain reference

#### Android
- Key pair is generated and stored in Android Keystore System
- Keys are referenced by alias
- Authentication requirements bound at creation time
- No additional reference storage needed

### Authentication Requirements

Authentication settings are determined at key creation time and cannot be modified:

```ts
// Create key with authentication
const key = await P256.createKeyPair({
  requireAuthentication: true,  // Permanent setting
  authenticationPrompt: "Authentication required"
})

// Subsequent operations will require authentication
const signature = await P256.sign({
  privateKeyStorageKey: key.privateKeyStorageKey,
  payload: '0xdeadbeef',
  // Authentication required regardless of options
})

// Counter example: Key without authentication
const simpleKey = await P256.createKeyPair({
  requireAuthentication: false  // Default setting
})

// No authentication required for operations
const simpleSignature = await P256.sign({
  privateKeyStorageKey: simpleKey.privateKeyStorageKey,
  payload: '0xdeadbeef'
})
```

### Error Handling

```ts
try {
  await P256.createKeyPair()
} catch (error) {
  // Handle specific error types:
  // - UnsupportedPlatformError: Device doesn't support P256
  // - BiometricAuthenticationError: Biometrics unavailable
  // - InvalidKeyPairError: Key generation failed
  // - InvalidKeyFormatError: Invalid key format
  // - InvalidSignatureError: Signature operation failed
}
```

## API Reference

| Function | Description |
|----------|-------------|
| `createKeyPair` | Creates a P256 key pair in secure hardware |
| `getKeyPair` | Retrieves a stored key pair |
| `sign` | Signs data using a stored key pair |
| `verify` | Verifies a signature |
| `isAvailableAsync` | Checks P256 hardware support |
| `deleteItemAsync` | Deletes a stored key pair |
| `canUseBiometricAuthentication` | Checks biometric availability |

## License

MIT
