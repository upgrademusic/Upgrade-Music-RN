const IS_DEV = process.env.APP_VARIANT === 'development';
const GOOGLE_MAPS_KEY = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY ?? '';

module.exports = {
  expo: {
    name: IS_DEV ? 'Upgrade Music (dev)' : 'Upgrade Music',
    slug: 'upgrade-music',
    version: '1.0.0',
    orientation: 'portrait',
    icon: './assets/images/icon.png',
    scheme: 'upgrademusic',
    userInterfaceStyle: 'dark',
    ios: {
      supportsTablet: false,
      bundleIdentifier: 'io.upgrademusic.app',
      config: {
        googleMapsApiKey: GOOGLE_MAPS_KEY,
      },
    },
    android: {
      package: 'io.upgrademusic.app',
      adaptiveIcon: {
        backgroundColor: '#0D0B1A',
        foregroundImage: './assets/images/android-icon-foreground.png',
      },
      predictiveBackGestureEnabled: false,
      config: {
        googleMaps: {
          apiKey: GOOGLE_MAPS_KEY,
        },
      },
    },
    web: {
      output: 'static',
      favicon: './assets/images/favicon.png',
    },
    plugins: [
      'expo-router',
      ['@stripe/stripe-react-native', { merchantIdentifier: 'merchant.io.upgrademusic.app' }],
      'expo-secure-store',
      [
        'expo-splash-screen',
        {
          backgroundColor: '#0D0B1A',
          android: {
            image: './assets/images/splash-icon.png',
            imageWidth: 76,
          },
        },
      ],
    ],
    experiments: {
      typedRoutes: true,
      reactCompiler: true,
    },
  },
};
