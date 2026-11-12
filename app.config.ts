import type { ConfigContext, ExpoConfig } from 'expo/config';

// Textos de permissão exibidos pelo sistema. Devem dizer para que o dado é usado,
// em português, e são revisados pela Apple na submissão. Ver docs/adr/0006.
const PERMISSIONS = {
  location: 'O Prosa usa sua localização para encontrar pessoas compatíveis perto de você.',
  camera: 'O Prosa usa a câmera para você tirar fotos do seu perfil e enviar nas conversas.',
  photos: 'O Prosa acessa suas fotos para você escolher imagens do perfil e enviar nas conversas.',
} as const;

export default ({ config }: ConfigContext): ExpoConfig => ({
  ...config,
  name: 'Prosa',
  slug: 'prosa',
  version: '0.1.0',
  scheme: 'prosa',
  orientation: 'portrait',
  // Só tema claro no MVP (docs/adr/0005).
  userInterfaceStyle: 'light',
  backgroundColor: '#FFFFFF',
  icon: './assets/images/icon.png',
  ios: {
    icon: './assets/expo.icon',
    supportsTablet: false,
    // bundleIdentifier: definir quando a organização/conta Apple existir.
  },
  android: {
    adaptiveIcon: {
      backgroundColor: '#FFFFFF',
      foregroundImage: './assets/images/android-icon-foreground.png',
      backgroundImage: './assets/images/android-icon-background.png',
      monochromeImage: './assets/images/android-icon-monochrome.png',
    },
    predictiveBackGestureEnabled: false,
    // Localização em segundo plano e gravação de áudio ficam fora do MVP.
    blockedPermissions: [
      'android.permission.ACCESS_BACKGROUND_LOCATION',
      'android.permission.RECORD_AUDIO',
    ],
    // package: definir quando a organização/conta Google Play existir.
  },
  web: {
    // Web existe só como preview de desenvolvimento; não é plataforma de entrega.
    favicon: './assets/images/favicon.png',
  },
  plugins: [
    'expo-router',
    'expo-secure-store',
    [
      'expo-splash-screen',
      {
        backgroundColor: '#FFFFFF',
        image: './assets/images/splash-icon.png',
        imageWidth: 76,
      },
    ],
    [
      'expo-location',
      {
        locationWhenInUsePermission: PERMISSIONS.location,
        locationAlwaysAndWhenInUsePermission: false,
        locationAlwaysPermission: false,
        isIosBackgroundLocationEnabled: false,
        isAndroidBackgroundLocationEnabled: false,
      },
    ],
    [
      'expo-image-picker',
      {
        cameraPermission: PERMISSIONS.camera,
        photosPermission: PERMISSIONS.photos,
        microphonePermission: false,
      },
    ],
  ],
  experiments: {
    typedRoutes: true,
    reactCompiler: true,
  },
});
