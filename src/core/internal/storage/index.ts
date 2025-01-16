/**
 * Platform-specific storage implementation.
 *
 * In Web projects:
 * - Uses IndexedDB via idb-keyval
 *
 * In React Native:
 * - Uses MMKV for high-performance native storage
 * - Handles BigInt serialization
 *
 * The correct implementation is automatically selected at build time
 * based on the platform-specific file extensions:
 * - .web.ts for web platforms
 * - .native.ts for React Native
 */
export { storage } from './storage'
