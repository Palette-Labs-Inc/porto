import '@ethersproject/shims'
import { Crypto } from '@peculiar/webcrypto'

if (typeof window === 'undefined') {
  global.window = {} as any
}

// Use @peculiar/webcrypto for proper WebCrypto API support, needed in ox/core/WebAuthnP256 for getPublicKey() method from crypto.subtle
const crypto = new Crypto()
global.crypto = crypto
