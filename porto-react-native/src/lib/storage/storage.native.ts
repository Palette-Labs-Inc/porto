import { Storage } from 'porto'
import { createMMKV } from 'react-native-mmkv'

import { replacer, reviver } from './utils.ts'

/**
 * MMKV-based storage for React Native (iOS/Android)
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
