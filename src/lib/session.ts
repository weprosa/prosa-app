import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

const TOKEN_KEY = 'prosa.session-token';

// SecureStore (Keychain / Keystore) não existe na web. O preview web guarda o token
// só em memória; web não é plataforma de entrega.
let memoryToken: string | null = null;
const isWeb = Platform.OS === 'web';

export async function getSessionToken() {
  return isWeb ? memoryToken : SecureStore.getItemAsync(TOKEN_KEY);
}

export async function saveSessionToken(token: string) {
  if (isWeb) memoryToken = token;
  else await SecureStore.setItemAsync(TOKEN_KEY, token);
}

export async function clearSessionToken() {
  if (isWeb) memoryToken = null;
  else await SecureStore.deleteItemAsync(TOKEN_KEY);
}
