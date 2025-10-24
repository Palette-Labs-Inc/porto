import { Platform } from 'react-native'
import * as ExpoCrypto from 'expo-crypto'
import { Crypto } from '@peculiar/webcrypto'

if (Platform.OS !== 'web') {
  type CryptoShim = Partial<Crypto> & {
    digest?: (algorithm: string, data: ArrayBuffer) => Promise<ArrayBuffer>
    getRandomValues?: (array: ArrayBufferView) => ArrayBufferView
    randomUUID?: () => string
  }
  const existing = (globalThis as any).crypto as CryptoShim | undefined

  const subtle = new Crypto().subtle

  Object.defineProperty(globalThis, 'crypto', {
    configurable: true,
    enumerable: true,
    value: {
      // keep existing values if already set by porto/expo-crypto shim
      getRandomValues:
        existing?.getRandomValues ?? ((array: ArrayBufferView) => ExpoCrypto.getRandomValues(array as any)),
      randomUUID: existing?.randomUUID ?? (() => ExpoCrypto.randomUUID()),
      digest:
        // ExpoCrypto.digest expects (algorithm, data)
        existing?.digest ?? ((algorithm: string, data: ArrayBuffer) => ExpoCrypto.digest(algorithm as any, data as any)),
      // the missing piece required by ox WebAuthn code paths
      subtle,
    },
  })
}


