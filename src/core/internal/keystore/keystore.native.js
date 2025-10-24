export const keystoreResolver = {
    resolveKeystoreHost: (keystoreHost) => {
        if (keystoreHost === 'self')
            return undefined;
        return keystoreHost;
    },
};
