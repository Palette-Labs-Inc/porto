import type { BufferSource } from './webauthn';
/**
 * Converts a BufferSource to a base64 string.
 *
 * @param buffer - The BufferSource to convert
 * @returns A base64 string representation of the buffer
 */
export declare function bufferSourceToBase64(buffer: BufferSource): string;
/**
 * Converts a base64 string to an ArrayBuffer
 * @internal
 */
export declare function base64ToArrayBuffer(base64: string): ArrayBuffer;
/**
 * Converts a base64url string to an ArrayBuffer, handling URL-safe characters
 * and padding appropriately.
 */
export declare function base64URLToArrayBuffer(base64url: string): ArrayBuffer;
//# sourceMappingURL=utils.d.ts.map