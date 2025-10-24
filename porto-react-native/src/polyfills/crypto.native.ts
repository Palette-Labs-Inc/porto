// biome-ignore lint/style/useNodejsImportProtocol: React Native requires 'buffer' package
import { Buffer } from 'buffer'
import { Crypto } from '@peculiar/webcrypto'
import { Platform } from 'react-native'

if (Platform.OS !== 'web') {
  if (typeof globalThis.Buffer === 'undefined')
    (globalThis as any).Buffer = Buffer

  if (globalThis.crypto && !globalThis.crypto.subtle)
    Object.defineProperty(globalThis.crypto, 'subtle', {
      enumerable: true,
      value: new Crypto().subtle,
    })
}
