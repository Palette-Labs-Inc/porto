const path = require('node:path')
const { FileStore } = require('metro-cache')
const { makeMetroConfig } = require('@rnx-kit/metro-config')
const { getDefaultConfig } = require('expo/metro-config')
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks')

const projectDir = __dirname
const workspaceRoot = path.resolve(projectDir, '../')
const portoRoot = path.resolve(workspaceRoot, 'src')

const symlinksResolver = MetroSymlinksResolver()
const usePortoSource = process.env.USE_PORTO_SOURCE === 'true'

function resolvePortoModule(context, moduleName) {
  // Handle porto module resolution
  if (moduleName === 'porto' || moduleName.startsWith('porto/')) {
    const relativePath =
      moduleName === 'porto'
        ? 'index.ts'
        : moduleName.replace('porto/', '').replace('.js', '.ts')

    const portoPath = path.join(portoRoot, relativePath)

    return {
      filePath: portoPath,
      type: 'sourceFile',
    }
  }

  // Handle internal .js to .ts resolution for porto package
  if (
    context.originModulePath.includes(portoRoot) &&
    moduleName.endsWith('.js')
  ) {
    const tsPath = path.join(
      path.dirname(context.originModulePath),
      moduleName.replace('.js', '.ts'),
    )
    return {
      filePath: tsPath,
      type: 'sourceFile',
    }
  }

  return null
}

/** @type {import('expo/metro-config').MetroConfig} */
const expoConfig = getDefaultConfig(projectDir)

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = makeMetroConfig({
  ...expoConfig,
  resolver: {
    ...expoConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      if (usePortoSource) {
        const portoResolution = resolvePortoModule(context, moduleName)
        if (portoResolution) return portoResolution
      }

      try {
        const res = symlinksResolver(context, moduleName, platform)
        if (res) return res
      } catch {}

      return context.resolveRequest(context, moduleName, platform)
    },
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs'],
    nodeModulesPaths: [
      path.resolve(projectDir, 'node_modules'),
      path.resolve(workspaceRoot, 'node_modules'),
      path.resolve(workspaceRoot, 'packages'),
      ...(usePortoSource ? [portoRoot] : []),
    ],
    extraNodeModules: usePortoSource
      ? {
          porto: portoRoot,
        }
      : undefined,
  },
  watchFolders: [
    workspaceRoot,
    path.resolve(workspaceRoot, 'packages'),
    ...(usePortoSource ? [portoRoot] : []),
  ],
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
