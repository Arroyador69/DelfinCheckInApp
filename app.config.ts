import { ExpoConfig, ConfigContext } from 'expo-config';

export default ({ config }: ConfigContext): ExpoConfig => {
  const isProduction = process.env.EXPO_PUBLIC_ENV === 'production';
  const apiUrl = process.env.EXPO_PUBLIC_API_URL || 'https://admin.delfincheckin.com';

  return {
    name: isProduction ? 'Delfín Check-in' : 'Delfín Check-in (Staging)',
    slug: 'delfin-owner',
    scheme: 'delfin',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/icon.png',
    userInterfaceStyle: 'automatic',
    splash: {
      image: './assets/splash.png',
      resizeMode: 'contain',
      backgroundColor: '#0b1220'
    },
    updates: {
      fallbackToCacheTimeout: 0
    },
    assetBundlePatterns: [
      '**/*'
    ],
    ios: {
      bundleIdentifier: 'com.desarroyo.delfinowner',
      supportsTablet: false,
      buildNumber: '1'
    },
    android: {
      package: 'com.desarroyo.delfinowner',
      adaptiveIcon: {
        foregroundImage: './assets/icon.png',
        backgroundColor: '#0b1220'
      },
      versionCode: 1
    },
    web: {
      favicon: './assets/favicon.png'
    },
    extra: {
      API_URL: apiUrl,
      eas: {
        projectId: '1408210e-72cc-49ab-b045-f91d89452a4e'
      }
    },
    plugins: [
      'expo-router',
      'expo-secure-store',
      'expo-notifications',
      [
        'expo-build-properties',
        {
          ios: {
            useFrameworks: 'static'
          },
          android: {
            kotlinVersion: '1.9.0'
          }
        }
      ]
    ]
  };
};

