// biome-ignore lint/style/useNodejsImportProtocol: React Native requires 'buffer' package
import { Buffer } from 'buffer'
import { Crypto, CryptoKey } from '@peculiar/webcrypto'
import { Platform } from 'react-native'

if (Platform.OS !== 'web') {
  if (typeof globalThis.Buffer === 'undefined')
    (globalThis as any).Buffer = Buffer

  if (typeof (globalThis as any).CryptoKey === 'undefined')
    (globalThis as any).CryptoKey = CryptoKey

  if (globalThis.crypto && !globalThis.crypto.subtle) {
    const cryptoSubtle = new Crypto().subtle
    
    // Create a proxy that makes generateKey undefined
    // This forces Porto to use Key.createP256() which stores keys as functions
    // while keeping other crypto.subtle methods available for other operations
    const subtleProxy = new Proxy(cryptoSubtle, {
      get(target, prop) {
        if (prop === 'generateKey') {
          // Return undefined to make Porto think WebCrypto is not available
          return undefined
        }
        return (target as any)[prop]
      }
    })
    
    Object.defineProperty(globalThis.crypto, 'subtle', {
      enumerable: true,
      value: subtleProxy,
    })
  }
}
