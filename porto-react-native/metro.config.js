// Learn more https://docs.expo.io/guides/customizing-metro
/**
 * @typedef {import('expo/metro-config').MetroConfig} MetroConfig
 */
const { getDefaultConfig } = require('expo/metro-config')
const path = require('node:path')

const defaultConfiguration = getDefaultConfig(__dirname)

/** @type {MetroConfig} */
module.exports = {
  ...defaultConfiguration,
  transformer: {
    ...defaultConfiguration.transformer,
  },
  resolver: {
    ...defaultConfiguration.resolver,
    unstable_enablePackageExports: true,
    unstable_conditionNames: [
      ...(defaultConfiguration.resolver?.unstable_conditionNames || []),
      'import',
    ],
    resolveRequest: (context, moduleName, platform) => {
      /**
       * if `node:crypto`, replace it with `expo-crypto`
       */
      if (moduleName.startsWith('node:crypto'))
        return {
          type: 'sourceFile',
          filePath: require.resolve('expo-crypto'),
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

      /**
       * Resolve Porto's internal webauthn module to the workspace native source
       * when requested from the Porto package. This ensures RN uses the native
       * Expo-backed implementation without redirecting other Porto imports.
       */
      try {
        const isFromPortoPackage =
          typeof context.originModulePath === 'string' &&
          context.originModulePath.includes(
            `${path.sep}node_modules${path.sep}porto${path.sep}`,
          )

        const isPortoWebAuthnInternal =
          moduleName === 'porto/core/internal/webauthn' ||
          /^\.\/internal\/webauthn(\.js)?$/.test(moduleName)

        if (isFromPortoPackage && isPortoWebAuthnInternal) {
          const filePath = path.resolve(
            __dirname,
            '..',
            'src/core/internal/webauthn/webauthn.native.ts',
          )
          return { type: 'sourceFile', filePath }
        }
      } catch {}

      return context.resolveRequest(context, moduleName, platform)
    },
  },
}
