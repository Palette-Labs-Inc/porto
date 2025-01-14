import type { ExpoConfig } from 'expo/config'

const config: ExpoConfig = {
  name: 'porto-expo',
  slug: 'porto-expo',
  scheme: 'porto',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  userInterfaceStyle: 'light',
  newArchEnabled: true,
  updates: {
    fallbackToCacheTimeout: 0,
  },
  assetBundlePatterns: ['**/*'],
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.perhats.wallet',
    associatedDomains: [
      'applinks:mperhats.github.io',
      'webcredentials:mperhats.github.io',
    ],
    config: {
      usesNonExemptEncryption: false,
    }
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/images/adaptive-icon.png',
      backgroundColor: '#FFFFFF',
    },
    intentFilters: [
      {
        action: 'VIEW',
        autoVerify: true,
        data: [{ scheme: 'https', host: 'mperhats.github.io' }],
        category: ['BROWSABLE', 'DEFAULT'],
      },
    ],
    package: 'com.perhats.wallet',
  },
  web: {
    bundler: 'metro',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router'
  ],
  experiments: {
    typedRoutes: true
  }
}

export default config
