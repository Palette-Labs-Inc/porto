/**
 * Porto Storage
 *
 * Platform-specific storage implementations:
 * - Native (iOS/Android): MMKV-based (fast, synchronous)
 * - Web: localStorage-based (with in-memory fallback)
 *
 * Metro bundler will automatically resolve:
 * - storage.native.ts for React Native platforms
 * - storage.ts for web platform
 */

export { storage } from './storage.ts'
export * from './utils.ts'
