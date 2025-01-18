import type { BufferSource } from './webauthn';
/**
 * Converts a BufferSource to a base64 string.
 */
export declare function bufferSourceToBase64(buffer: BufferSource): string;
/**
 * Converts a base64 string to an ArrayBuffer
 * @internal
 */
export declare function base64ToArrayBuffer(base64: string): ArrayBuffer;
/**
 * Converts a base64url string to an ArrayBuffer.
 * Handles URL-safe characters and padding according to RFC 4648.
 */
export declare function base64URLToArrayBuffer(base64url: string): ArrayBuffer;
//# sourceMappingURL=utils.d.ts.map