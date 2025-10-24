import { Storage } from 'porto'

/**
 * Web-based storage using Porto's built-in storage options
 *
 * Uses IndexedDB with automatic fallback to localStorage or memory
 * Porto handles availability detection and graceful degradation
 */

export const storage =
  typeof indexedDB !== 'undefined'
    ? Storage.idb()
    : typeof window !== 'undefined' && window.localStorage
      ? Storage.localStorage()
      : Storage.memory()
