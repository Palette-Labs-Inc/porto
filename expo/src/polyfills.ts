import 'react-native-get-random-values' // needs to precede the other imports
import { Crypto } from '@peculiar/webcrypto'
// biome-ignore lint/style/useNodejsImportProtocol: <explanation>
import { Buffer } from 'buffer'

if (typeof window === 'undefined') {
  global.window = {} as any
}
// Polyfill global crypto
if (typeof global.crypto === 'undefined') {
  // Use @peculiar/webcrypto to polyfill ox/core/WebAuthnP256 for getPublicKey() method from crypto.subtle
  const crypto = new Crypto()
  global.crypto = crypto
}

// Polyfill Buffer if needed
if (typeof global.Buffer === 'undefined') {
  // @ts-ignore
  global.Buffer = Buffer
}

// Use @peculiar/webcrypto for proper WebCrypto API support, needed in ox/core/WebAuthnP256 for getPublicKey() method from crypto.subtle
const crypto = new Crypto()
global.crypto = crypto