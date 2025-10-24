import { Storage } from 'porto'
import { createMMKV } from 'react-native-mmkv'

import { replacer, reviver } from './utils.ts'

/**
 * MMKV-based storage for React Native (iOS/Android)
 */
// Create MMKV instance
const mmkv = createMMKV()

/**
 * Log all stored data in MMKV (for debugging)
 */
function logEntireStore() {
  // biome-ignore lint/suspicious/noConsoleLog: Debugging function
  console.log('========================================')
  // biome-ignore lint/suspicious/noConsoleLog: Debugging function
  console.log('📦 MMKV Storage Contents (App Refresh)')
  // biome-ignore lint/suspicious/noConsoleLog: Debugging function
  console.log('========================================')

  const allKeys = mmkv.getAllKeys()

  if (allKeys.length === 0) {
    // biome-ignore lint/suspicious/noConsoleLog: Debugging function
    console.log('⚠️  Storage is empty')
  } else {
    // biome-ignore lint/suspicious/noConsoleLog: Debugging function
    console.log(`📊 Total keys: ${allKeys.length}`)
    // biome-ignore lint/suspicious/noConsoleLog: Debugging function
    console.log('----------------------------------------')

    for (const key of allKeys) {
      const value = mmkv.getString(key)
      try {
        const parsed = value ? JSON.parse(value, reviver) : null
        // biome-ignore lint/suspicious/noConsoleLog: Debugging function
        console.log('\n🔑 Key:', key)
        // biome-ignore lint/suspicious/noConsoleLog: Debugging function
        console.log('📄 Value:', parsed)
        // biome-ignore lint/suspicious/noConsoleLog: Debugging function
        console.log('📄 Formatted:', JSON.stringify(parsed, replacer, 2))
      } catch (error) {
        // biome-ignore lint/suspicious/noConsoleLog: Debugging function
        console.log('\n🔑 Key:', key)
        // biome-ignore lint/suspicious/noConsoleLog: Debugging function
        console.log('📄 Raw Value:', value)
        // biome-ignore lint/suspicious/noConsoleLog: Debugging function
        console.log('⚠️  Parse Error:', error)
      }
    }
  }

  // biome-ignore lint/suspicious/noConsoleLog: Debugging function
  console.log('\n========================================')
  // biome-ignore lint/suspicious/noConsoleLog: Debugging function
  console.log('✅ Storage dump complete')
  // biome-ignore lint/suspicious/noConsoleLog: Debugging function
  console.log('========================================\n')
}

// Log storage contents on initialization (app refresh)
logEntireStore()

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
