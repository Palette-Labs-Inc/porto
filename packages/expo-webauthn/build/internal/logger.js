const DEBUG = true; // Set to false in production
export const logger = {
    debug: (message, ...args) => {
        if (DEBUG) {
            // biome-ignore lint/suspicious/noConsoleLog: <explanation>
            console.log(`[expo-webauthn] ${message}`, ...args);
        }
    },
    error: (message, error) => {
        console.error(`[expo-webauthn] ${message}`, error);
    },
};
//# sourceMappingURL=logger.js.map