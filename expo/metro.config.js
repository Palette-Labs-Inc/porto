const path = require('node:path')
const { FileStore } = require('metro-cache')
const { makeMetroConfig } = require('@rnx-kit/metro-config')
const { getDefaultConfig } = require('expo/metro-config')
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks')

const projectDir = __dirname
const workspaceRoot = path.resolve(projectDir, '../')

const symlinksResolver = MetroSymlinksResolver()

/** @type {import('expo/metro-config').MetroConfig} */
const expoConfig = getDefaultConfig(projectDir)

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = makeMetroConfig({
  ...expoConfig,
  resolver: {
    ...expoConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      
      try {
        const res = symlinksResolver(context, moduleName, platform)
        if (res) return res
      } catch {}

      return context.resolveRequest(context, moduleName, platform)
    },
    sourceExts: [...expoConfig.resolver.sourceExts, 'ts', 'tsx'],
    nodeModulesPaths: [
      path.resolve(projectDir, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'packages'),
    ],
  },
  watchFolders: [workspaceRoot, path.resolve(workspaceRoot, 'packages')],
  transformer: {
    ...expoConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },
  cacheStores: [
    new FileStore({
      root: path.join(projectDir, 'node_modules', '.cache', 'metro'),
    }),
  ],
})
