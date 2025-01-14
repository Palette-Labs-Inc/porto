/**
 * Base error class for WebAuthn operations
 */
export class WebAuthnError extends Error {
    cause;
    constructor(message, options) {
        super(message);
        this.name = this.constructor.name;
        if (options?.metaMessages) {
            this.metaMessages = options.metaMessages;
        }
        if (options?.cause) {
            this.cause = options.cause;
        }
    }
    metaMessages;
}
//# sourceMappingURL=types.js.map