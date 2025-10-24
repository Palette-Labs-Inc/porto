// Configure Porto React Native environment
// Provides basic crypto polyfills (getRandomValues, randomUUID, digest)
// and React Native environment setup (auth sessions, deep linking)
import 'porto/react-native/register'

// Extend crypto with SubtleCrypto API
// Required by ox/WebAuthnP256 for credential key operations
import './src/polyfills/crypto.native'

// Expo Router entry point
import 'expo-router/entry'
