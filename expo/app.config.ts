import type { ConfigContext, ExpoConfig } from 'expo/config'

export default ({ config }: ConfigContext): ExpoConfig => ({
  name: 'porto-expo',
  slug: 'porto-expo',
  version: '1.0.0',
  orientation: 'portrait',
  icon: './assets/images/icon.png',
  scheme: 'porto-expo',
  userInterfaceStyle: 'automatic',
  newArchEnabled: true,
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
  ios: {
    supportsTablet: true,
    bundleIdentifier: 'com.perhats.wallet',
    associatedDomains: [
      'applinks:mperhats.github.io',
      'webcredentials:mperhats.github.io',
    ],
    config: {
      usesNonExemptEncryption: false,
    },
  },
  android: {
    adaptiveIcon: {
      foregroundImage: './assets/adaptive-icon.png',
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
    output: 'static',
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    [
      'expo-splash-screen',
      {
        image: './assets/images/splash-icon.png',
        imageWidth: 200,
        resizeMode: 'contain',
        backgroundColor: '#ffffff',
      },
    ],
    [
      '@porto/expo-p256',
      {
        configureAndroidBackup: true,
        faceIDPermission:
          'Allow Porto Wallet to access your Face ID biometric data.',
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
  },
})

