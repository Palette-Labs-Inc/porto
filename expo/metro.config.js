const path = require('node:path')
const fs = require('node:fs')
const { FileStore } = require('metro-cache')
const { makeMetroConfig } = require('@rnx-kit/metro-config')
const { getDefaultConfig } = require('expo/metro-config')
const MetroSymlinksResolver = require('@rnx-kit/metro-resolver-symlinks')

// Project paths
const PATHS = {
  project: __dirname,
  workspace: path.resolve(__dirname, '../'),
  portoSource: path.resolve(__dirname, '../src'),
  packages: path.resolve(__dirname, '../packages'),
}

// Metro configuration helpers
const symlinksResolver = MetroSymlinksResolver()

/**
 * Resolves porto module imports to source files
 */
function resolvePortoModule(context, moduleName) {
  // Not a porto module or expo package, skip
  if (
    !moduleName.startsWith('porto') &&
    !moduleName.startsWith('expo-webauthn') &&
    !moduleName.startsWith('expo-p256')
  ) {
    return null
  }

  // Convert module path to typescript source path
  let sourcePath
  if (moduleName === 'porto') {
    sourcePath = path.join(PATHS.portoSource, 'index.ts')
  } else if (moduleName.startsWith('expo-webauthn')) {
    const relativePath = moduleName
      .replace('expo-webauthn', 'src')
      .replace('.js', '.ts')
    sourcePath = path.join(PATHS.packages, 'expo-webauthn', relativePath)
  } else if (moduleName.startsWith('expo-p256')) {
    const relativePath = moduleName
      .replace('expo-p256', 'src')
      .replace('.js', '.ts')
    sourcePath = path.join(PATHS.packages, 'expo-p256', relativePath)
  } else {
    const relativePath = moduleName.replace('porto/', '').replace('.js', '.ts')
    sourcePath = path.join(PATHS.portoSource, relativePath)
  }

  // Check if source file exists
  if (fs.existsSync(sourcePath)) {
    return {
      filePath: sourcePath,
      type: 'sourceFile',
    }
  }

  return null
}

/**
 * Resolves .js imports to .ts source files within porto
 */
function resolveTypescriptFile(context, moduleName) {
  if (
    !context.originModulePath.includes(PATHS.portoSource) ||
    !moduleName.endsWith('.js')
  ) {
    return null
  }

  const tsPath = path.join(
    path.dirname(context.originModulePath),
    moduleName.replace('.js', '.ts'),
  )

  if (fs.existsSync(tsPath)) {
    return {
      filePath: tsPath,
      type: 'sourceFile',
    }
  }

  return null
}

// Get base Expo config
const expoConfig = getDefaultConfig(PATHS.project)

/** @type {import('expo/metro-config').MetroConfig} */
module.exports = makeMetroConfig({
  ...expoConfig,

  // Module resolution configuration
  resolver: {
    ...expoConfig.resolver,
    resolveRequest: (context, moduleName, platform) => {
      // Only apply polyfills for native platforms
      if (platform !== 'web') {
        const nativePolyfills = {
          crypto: require.resolve('@peculiar/webcrypto'),
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

      // Try resolving porto modules first
      const portoResolution = resolvePortoModule(context, moduleName)
      if (portoResolution) return portoResolution

      // Then try resolving typescript files
      const tsResolution = resolveTypescriptFile(context, moduleName)
      if (tsResolution) return tsResolution

      // Finally try symlinks resolution
      try {
        const symlinkResolution = symlinksResolver(
          context,
          moduleName,
          platform,
        )
        if (symlinkResolution) return symlinkResolution
      } catch {}

      // Fallback to default resolution
      return context.resolveRequest(context, moduleName, platform)
    },

    // File extensions to process
    sourceExts: ['ts', 'tsx', 'js', 'jsx', 'json', 'cjs', 'mjs'],

    // Module resolution paths
    nodeModulesPaths: [
      path.join(PATHS.project, 'node_modules'),
      path.join(PATHS.workspace, 'node_modules'),
      PATHS.packages,
      PATHS.portoSource,
    ],

    // Additional module mappings
    extraNodeModules: {
      // Map porto to source
      porto: PATHS.portoSource,
    },
  },

  // Directories to watch for changes
  watchFolders: [PATHS.workspace, PATHS.packages, PATHS.portoSource],

  // Transformer configuration
  transformer: {
    ...expoConfig.transformer,
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: true,
      },
    }),
  },

  // Cache configuration
  cacheStores: [
    new FileStore({
      root: path.join(PATHS.project, 'node_modules', '.cache', 'metro'),
    }),
  ],
})
