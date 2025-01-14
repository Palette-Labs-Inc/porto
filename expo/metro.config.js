// Learn more https://docs.expo.io/guides/customizing-metro
const { makeMetroConfig } = require('@rnx-kit/metro-config')
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks')
const path = require('node:path')
const { getDefaultConfig } = require('expo/metro-config')

const defaultConfig = getDefaultConfig(__dirname)
const symlinksResolver = MetroSymlinksResolver()

module.exports = makeMetroConfig({
  projectRoot: __dirname,
  resolver: {
    ...defaultConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      try {
        // First try the symlinks resolver
        const resolution = symlinksResolver(context, moduleName, platform)
        if (resolution) {
          return resolution
        }
      } catch {
        // If we have an error, we pass it on to the next resolver in the chain,
        // which should be one of expo's
      }
      // Fallback to the default expo resolver
      return context.resolveRequest(context, moduleName, platform)
    },
    unstable_enablePackageExports: true,
    nodeModulesPaths: [
      path.resolve(__dirname, 'node_modules'),
      path.resolve(__dirname, '../node_modules'),
    ],
  },
})
