import { fromByteArray, toByteArray } from 'base64-js'
/**
 * Converts a BufferSource to a base64 string.
 *
 * @param buffer - The BufferSource to convert
 * @returns A base64 string representation of the buffer
 */
export function bufferSourceToBase64(buffer) {
  const uint8Array =
    buffer instanceof Uint8Array
      ? buffer
      : new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer)
  return fromByteArray(uint8Array)
}
/**
 * Converts a base64 string to an ArrayBuffer
 * @internal
 */
export function base64ToArrayBuffer(base64) {
  const uint8Array = toByteArray(base64)
  return uint8Array.buffer
}
export function base64URLToArrayBuffer(base64url) {
  const base64 = base64url.replace(/-/g, '+').replace(/_/g, '/')
  const padded = base64.padEnd(
    base64.length + ((4 - (base64.length % 4)) % 4),
    '=',
  )
  const uint8Array = toByteArray(padded)
  return uint8Array.buffer
}
//# sourceMappingURL=utils.js.map
