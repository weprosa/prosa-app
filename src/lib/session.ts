import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const SESSION_KEY = 'prosa.session-token';

export type Session = { token: string; expiresAt: number };

// SecureStore (Keychain / Keystore) não existe na web. O preview web guarda o token
// só em memória; web não é plataforma de entrega.
let memorySession: string | null = null;
const isWeb = Platform.OS === 'web';

export async function getSession(): Promise<Session | null> {
  const stored = isWeb ? memorySession : await SecureStore.getItemAsync(SESSION_KEY);
  if (!stored) return null;

  try {
    const session: unknown = JSON.parse(stored);
    if (
      typeof session === 'object' &&
      session !== null &&
      'token' in session &&
      typeof session.token === 'string' &&
      session.token.length > 0 &&
      'expiresAt' in session &&
      typeof session.expiresAt === 'number' &&
      Number.isFinite(session.expiresAt)
    ) {
      return { token: session.token, expiresAt: session.expiresAt };
    }
  } catch {
    // Dados antigos ou corrompidos não representam uma sessão válida.
  }
  return null;
}

export async function saveSession(token: string, expiresInSeconds: number): Promise<void> {
  const session: Session = { token, expiresAt: Date.now() + expiresInSeconds * 1000 };
  const stored = JSON.stringify(session);
  if (isWeb) memorySession = stored;
  else await SecureStore.setItemAsync(SESSION_KEY, stored);
}

export async function clearSession(): Promise<void> {
  if (isWeb) memorySession = null;
  else await SecureStore.deleteItemAsync(SESSION_KEY);
}

export function isExpired(session: Session, now = Date.now()): boolean {
  return now >= session.expiresAt;
}
