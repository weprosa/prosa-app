import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';

/**
 * `blocked`: a pessoa negou e o sistema não mostra mais o diálogo. A tela deve
 * explicar e oferecer `Linking.openSettings()`.
 */
export type PermissionResult = 'granted' | 'denied' | 'blocked';

type PermissionResponse = { granted: boolean; canAskAgain: boolean };

async function ensure(
  get: () => Promise<PermissionResponse>,
  request: () => Promise<PermissionResponse>,
): Promise<PermissionResult> {
  const current = await get();
  if (current.granted) return 'granted';
  if (!current.canAskAgain) return 'blocked';

  const next = await request();
  if (next.granted) return 'granted';
  return next.canAskAgain ? 'denied' : 'blocked';
}

// Peça cada permissão no momento do uso, depois de a tela explicar o porquê, e
// nunca na abertura do app (docs/adr/0006).

/** Localização só com o app em uso. Segundo plano está fora do MVP. */
export const ensureLocationPermission = () =>
  ensure(Location.getForegroundPermissionsAsync, Location.requestForegroundPermissionsAsync);

export const ensureCameraPermission = () =>
  ensure(ImagePicker.getCameraPermissionsAsync, ImagePicker.requestCameraPermissionsAsync);

export const ensurePhotoLibraryPermission = () =>
  ensure(
    () => ImagePicker.getMediaLibraryPermissionsAsync(),
    () => ImagePicker.requestMediaLibraryPermissionsAsync(),
  );
