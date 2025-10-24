import { Storage } from 'porto'

/**
 * Web-based storage using Porto's built-in storage options
 *
 * Uses IndexedDB on web
 */
export const storage = Storage.localStorage()