import { Storage } from 'porto'

/**
 * Web-based storage using Porto's built-in storage options
 *
 * Porto provides optimized storage backends for web:
 * - IndexedDB (default, ~50MB, best performance)
 * - localStorage (~5MB, good compatibility)
 * - cookie (~4KB, cross-domain support)
 * - memory (fallback, no persistence)
 *
 * This configuration uses a combination strategy for maximum reliability:
 * 1. Try IndexedDB first (best performance and capacity)
 * 2. Fall back to localStorage if IndexedDB is unavailable
 * 3. Fall back to memory if both are unavailable
 */

export const storage = (() => {
  // Check if we're in a browser environment
  if (typeof window === 'undefined') {
    return Storage.memory()
  }

  // Check if IndexedDB is available
  const hasIndexedDB = (() => {
    try {
      return typeof indexedDB !== 'undefined'
    } catch {
      return false
    }
  })()

  // Check if localStorage is available
  const hasLocalStorage = (() => {
    try {
      if (!window.localStorage) return false
      const test = '__porto_storage_test__'
      window.localStorage.setItem(test, 'test')
      window.localStorage.removeItem(test)
      return true
    } catch {
      return false
    }
  })()

  // Use the best available storage option
  if (hasIndexedDB) {
    // IndexedDB: ~50MB, best performance, default for browsers
    return Storage.idb()
  }

  if (hasLocalStorage) {
    // localStorage: ~5MB, good compatibility fallback
    console.info('Porto: IndexedDB unavailable, using localStorage')
    return Storage.localStorage()
  }

  // In-memory: No persistence, last resort
  console.warn(
    'Porto: IndexedDB and localStorage unavailable, using in-memory storage. Data will not persist.',
  )
  return Storage.memory()
})()

