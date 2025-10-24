// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config')
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks')

const defaultConfiguration = getDefaultConfig(__dirname)
const symlinksResolver = MetroSymlinksResolver()

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = {
  ...defaultConfiguration,
  transformer: {
    ...defaultConfiguration.transformer,
  },
  resolver: {
    ...defaultConfiguration.resolver,
    sourceExts: [
      'ts',
      'tsx',
      'js',
      'jsx',
      'json',
      'cjs',
      'mjs',
      ...(defaultConfiguration.resolver?.sourceExts || []),
    ],
    unstable_enablePackageExports: true,
    unstable_conditionNames: [
      ...(defaultConfiguration.resolver?.unstable_conditionNames || []),
      'import',
    ],
    resolveRequest: (context, moduleName, platform) => {
      /**
       * Polyfill Node.js modules for React Native
       */
      if (platform !== 'web') {
        const nativePolyfills = {
          crypto: require.resolve('react-native-quick-crypto'),
          buffer: require.resolve('buffer'),
          stream: require.resolve('stream-browserify'),
          util: require.resolve('util'),
        }

        if (nativePolyfills[moduleName]) {
          try {
            const polyfillPath = nativePolyfills[moduleName]
            const symlinkResolution = symlinksResolver(
              context,
              polyfillPath,
              platform,
            )
            if (symlinkResolution) return symlinkResolution
          } catch {}
        }
      }

      /**
       * Prefer CJS for `ox` or `@noble/hashes` to avoid `window.*` usage in ESM builds
       * TODO: fix this in `ox`
       */
      if (moduleName.startsWith('ox'))
        return {
          type: 'sourceFile',
          filePath: require.resolve(moduleName),
        }

      // Try symlinks resolution
      try {
        const symlinkResolution = symlinksResolver(
          context,
          moduleName,
          platform,
        )
        if (symlinkResolution) return symlinkResolution
      } catch {}

      return context.resolveRequest(context, moduleName, platform)
    },
  },
}
