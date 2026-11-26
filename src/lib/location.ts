import * as Location from 'expo-location';
import { Platform } from 'react-native';

import { ensureLocationPermission } from '@/lib/permissions';

export type CurrentLocationResult =
  | { status: 'granted'; latitude: number; longitude: number; city: string | null }
  | { status: 'denied' | 'blocked' | 'unavailable' };

const POSITION_TIMEOUT_MS = 15_000;
const GEOCODING_TIMEOUT_MS = 3_000;

type CurrentLocationOptions = {
  reverseGeocode?: boolean;
  timeoutMs?: number;
};

async function withTimeout<T>(operation: Promise<T>, milliseconds: number): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  try {
    return await Promise.race([
      operation,
      new Promise<never>((_, reject) => {
        timer = setTimeout(() => reject(new Error('Tempo de localização esgotado.')), milliseconds);
      }),
    ]);
  } finally {
    clearTimeout(timer);
  }
}

/** Uma posição de até alguns minutos atrás basta para a precisão enviada (2 casas). */
const LAST_KNOWN_MAX_AGE_MS = 5 * 60 * 1000;

async function readPosition(timeoutMs: number) {
  const lastKnown = await Location.getLastKnownPositionAsync({
    maxAge: LAST_KNOWN_MAX_AGE_MS,
  }).catch(() => null);
  if (lastKnown) return lastKnown;

  return withTimeout(
    Location.getCurrentPositionAsync({
      accuracy: Location.Accuracy.Balanced,
      mayShowUserSettingsDialog: false,
    }),
    timeoutMs,
  );
}

/** Lê sem pedir permissão e reduz a precisão antes de compartilhar as coordenadas. */
export async function readRoundedCoordinates({ timeoutMs = POSITION_TIMEOUT_MS } = {}): Promise<{
  latitude: number;
  longitude: number;
}> {
  const { coords } = await readPosition(timeoutMs);
  return {
    latitude: Number(coords.latitude.toFixed(2)),
    longitude: Number(coords.longitude.toFixed(2)),
  };
}

/** Captura pontual, com consentimento em uso. A cidade é apenas uma sugestão. */
export async function getCurrentLocation({
  reverseGeocode = true,
  timeoutMs = POSITION_TIMEOUT_MS,
}: CurrentLocationOptions = {}): Promise<CurrentLocationResult> {
  try {
    // O tempo limite vale só para a leitura: a pessoa decide a permissão no seu ritmo.
    // Na web, o próprio pedido de permissão espera uma posição do navegador.
    const permission = await (Platform.OS === 'web'
      ? withTimeout(ensureLocationPermission(), timeoutMs)
      : ensureLocationPermission());
    if (permission !== 'granted') return { status: permission };

    const { coords } = await readPosition(timeoutMs);
    const { latitude, longitude } = coords;
    let city: string | null = null;

    // O Expo não oferece geocodificação reversa na web.
    if (reverseGeocode && Platform.OS !== 'web') {
      try {
        const [address] = await withTimeout(
          Location.reverseGeocodeAsync({ latitude, longitude }),
          GEOCODING_TIMEOUT_MS,
        );
        city = address?.city?.trim() || address?.subregion?.trim() || null;
      } catch {
        // Sem geocodificador ou sem rede, as coordenadas continuam utilizáveis.
      }
    }

    // Envia só a precisão necessária ao match, conforme o ADR 0006.
    return {
      status: 'granted',
      latitude: Number(latitude.toFixed(2)),
      longitude: Number(longitude.toFixed(2)),
      city,
    };
  } catch {
    return { status: 'unavailable' };
  }
}
