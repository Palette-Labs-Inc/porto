// biome-ignore lint/style/useNodejsImportProtocol: React Native requires 'buffer' package
import { Buffer } from 'buffer'
// biome-ignore lint/style/useNodejsImportProtocol: React Native requires 'util' package
import { TextDecoder, TextEncoder } from 'util'
import { Crypto, CryptoKey } from '@peculiar/webcrypto'
import { Platform } from 'react-native'

if (Platform.OS !== 'web') {
  if (typeof globalThis.Buffer === 'undefined')
    (globalThis as any).Buffer = Buffer

  if (typeof (globalThis as any).CryptoKey === 'undefined')
    (globalThis as any).CryptoKey = CryptoKey

  if (typeof (globalThis as any).TextDecoder === 'undefined')
    (globalThis as any).TextDecoder = TextDecoder

  if (typeof (globalThis as any).TextEncoder === 'undefined')
    (globalThis as any).TextEncoder = TextEncoder

  if (globalThis.crypto && !globalThis.crypto.subtle)
    Object.defineProperty(globalThis.crypto, 'subtle', {
      enumerable: true,
      value: new Crypto().subtle,
    })
}
