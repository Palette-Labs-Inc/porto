import 'tsx/cjs'
import type { ConfigContext, ExpoConfig } from 'expo/config'
import pkg from './package.json'

const scheme = 'customer-native'

const dev =
  process.env.NODE_ENV === 'development' ||
  process.env.ENVIRONMENT === 'development'

// Single strategy: read full tunnel URL and extract host for Associated Domains (guarded)
function getTunnelHost(): string | undefined {
  const url = process.env.EXPO_TUNNEL_URL
  if (!url) return undefined
  try {
    return new URL(url).host
  } catch {
    return undefined
  }
}
const tunnelHost = getTunnelHost()

export default (context: ConfigContext): ExpoConfig => ({
  ...context.config,
  slug: pkg.name,
  name: pkg.name,
  version: pkg.version,
  newArchEnabled: true,
  userInterfaceStyle: 'automatic',
  platforms: ['android', 'ios', 'web'],
  ios: {
    config: {
      usesNonExemptEncryption: false,
    },
    buildNumber: pkg.version,
    supportsTablet: true,
    appleTeamId: 'JYD77N4AR8',
    bundleIdentifier: 'com.yelo.noshDelivery',
    associatedDomains: tunnelHost
      ? [
          `applinks:${tunnelHost}`,
          `webcredentials:${tunnelHost}`,
          `activitycontinuation:${tunnelHost}`,
        ]
      : undefined,
  },
  android: {
    newArchEnabled: true,
    edgeToEdgeEnabled: true,
    package: 'com.yelo.noshDelivery',
  },
  web: {
    output: 'single',
    bundler: 'metro',
  },
  experiments: {
    typedRoutes: true,
    turboModules: true,
  },
  plugins: [
    [
      'expo-router',
      {
        origin: tunnelHost ? `https://${tunnelHost}` : undefined,
        headOrigin: dev
          ? tunnelHost
            ? `https://${tunnelHost}`
            : undefined
          : `https://${process.env.EXPO_PUBLIC_SERVER_DOMAIN}`,
      },
    ],
    ['patch-project'],
    ['expo-dev-client', { launchMode: 'most-recent' }],
    [
      'expo-build-properties',
      {
        android: {
          packagingOptions: {
            pickFirst: ['**/libcrypto.so'],
          },
        },
      },
    ],
    ['expo-web-browser', { experimentalLauncherActivity: true }],
    [
      'expo-local-authentication',
      { faceIDPermission: 'Allow $(PRODUCT_NAME) to use Face ID.' },
    ],
    [
      'expo-secure-store',
      {
        configureAndroidBackup: true,
        faceIDPermission:
          'Allow $(PRODUCT_NAME) to access your Face ID biometric data.',
      },
    ],
    [
      './plugins/android.ts',
      {
        workersMax: 2,
        enableDebugSuffix: false,
        disableReleaseLint: true,
        versionNameSuffix: '-debug',
        jvmArgs: [
          '-Xmx4096m',
          '-XX:MaxMetaspaceSize=1024m',
          '-Dfile.encoding=UTF-8',
          '-Dkotlin.daemon.jvm.options=-Xmx2048m',
        ].join(' '),
      },
    ],
    [
      './plugins/ios.ts',
      { enableDebugSuffix: false, bundleIdSuffix: '.debug' },
    ],
  ],
})
