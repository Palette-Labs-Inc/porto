import { Storage } from 'porto'
import { createMMKV } from 'react-native-mmkv'

import { replacer, reviver } from './utils.ts'

/**
 * MMKV-based storage for React Native (iOS/Android)
 *
 * MMKV is ~30x faster than AsyncStorage and provides:
 * - Fully synchronous operations (no async/await needed)
 * - High performance C++ implementation using JSI
 * - Encryption support for secure storage
 * - Multiple instances support
 * - Web fallback support (via Porto's built-in storage)
 */

// Create MMKV instance
const mmkv = createMMKV()

export const storage = Storage.from({
  getItem(name) {
    const value = mmkv.getString(name)
    return value ? JSON.parse(value, reviver) : null
  },
  setItem(name, value) {
    mmkv.set(name, JSON.stringify(value, replacer))
  },
  removeItem(name) {
    mmkv.remove(name)
  },
  // MMKV is highly efficient and can handle large amounts of data
  sizeLimit: 1024 * 1024 * 50, // ≈50MB
})

