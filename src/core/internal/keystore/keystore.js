export const keystoreResolver = {
  resolveKeystoreHost: (keystoreHost) => {
    if (keystoreHost === 'self') return undefined
    if (
      typeof window !== 'undefined' &&
      window.location.hostname === 'localhost'
    )
      return undefined
    const resolvedHost = keystoreHost
    return resolvedHost
  },
}
