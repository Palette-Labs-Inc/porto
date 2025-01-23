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
  splash: {
    image: './assets/images/splash-icon.png',
    resizeMode: 'contain',
    backgroundColor: '#ffffff',
  },
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
    },
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
    'expo-router',
    [
      'expo-build-properties',
      {
        android: {
          targetSdkVersion: 34,
          minSdkVersion: 23, // minSdkVersion for biometrics on android.
          kotlinVersion: '1.9.24',
        },
        ios: {
          deploymentTarget: '15.4', // min iOS version for passkeys on iOS.
          useFrameworks: 'static',
        },
      },
    ],
    [
      '@porto/expo-p256',
      {
        configureAndroidBackup: true,
        faceIDPermission: "Allow Porto Wallet to access your Face ID biometric data."
      }
    ]
  ],
  experiments: {
    typedRoutes: true,
  },
}

export default config
