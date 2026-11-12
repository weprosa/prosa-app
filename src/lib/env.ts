/**
 * Variáveis `EXPO_PUBLIC_*` são embutidas no bundle e visíveis para qualquer pessoa
 * com o app instalado. Nunca coloque segredo aqui (docs/adr/0008).
 */
export const env = {
  apiUrl: process.env.EXPO_PUBLIC_API_URL,
} as const;
