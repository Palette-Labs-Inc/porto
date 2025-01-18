import { Base64 } from 'ox';
/**
 * Converts a BufferSource to a base64 string.
 */
export function bufferSourceToBase64(buffer) {
    const uint8Array = buffer instanceof Uint8Array
        ? buffer
        : new Uint8Array(buffer instanceof ArrayBuffer ? buffer : buffer.buffer);
    return Base64.fromBytes(uint8Array);
}
/**
 * Converts a base64 string to an ArrayBuffer
 * @internal
 */
export function base64ToArrayBuffer(base64) {
    return Base64.toBytes(base64).buffer;
}
/**
 * Converts a base64url string to an ArrayBuffer.
 * Handles URL-safe characters and padding according to RFC 4648.
 */
export function base64URLToArrayBuffer(base64url) {
    const base64 = base64url
        .replace(/-/g, '+')
        .replace(/_/g, '/')
        .replace(/=+$/, '')
        .padEnd(base64url.length + ((4 - (base64url.length % 4)) % 4), '=');
    return new Uint8Array(Base64.toBytes(base64)).buffer;
}
//# sourceMappingURL=utils.js.map