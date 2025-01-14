import { Base64 } from 'ox'
import type { BufferSource } from './webauthn'

/**
 * Converts a BufferSource to a base64 string.
 *
 * @param buffer - The BufferSource to convert
 * @returns A base64 string representation of the buffer
 */
export function bufferSourceToBase64(buffer: BufferSource): string {
  const uint8Array =
    buffer instanceof Uint8Array
      ? buffer
      : new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer)
  return Base64.fromBytes(uint8Array)
}

/**
 * Converts a base64 string to an ArrayBuffer
 * @internal
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const uint8Array = Base64.toBytes(base64)
  return uint8Array.buffer
}

/**
 * Converts a base64url string to an ArrayBuffer, handling URL-safe characters
 * and padding appropriately.
 */
export function base64URLToArrayBuffer(base64url: string): ArrayBuffer {
  // Base64.toBytes already handles URL-safe characters, just need to handle padding
  const padded = base64url.padEnd(
    base64url.length + ((4 - (base64url.length % 4)) % 4),
    '=',
  )
  const uint8Array = Base64.toBytes(padded)
  return uint8Array.buffer
}
