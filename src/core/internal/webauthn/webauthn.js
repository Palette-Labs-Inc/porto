import * as WebAuthnP256 from 'ox/WebAuthnP256';
export const createCredential = async (options) => {
    return WebAuthnP256.createCredential(options);
};
export const sign = async (options) => {
    return WebAuthnP256.sign(options);
};
