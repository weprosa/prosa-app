import type { SharedValue } from 'react-native-reanimated';

/**
 * Contrato do ditado por voz (docs/adr/0012). A implementação fica em
 * `voice-dictation.ts`; a tela só conhece estes tipos.
 */

/** `stopping`: o microfone já desligou e o texto final está chegando. */
export type DictationStatus = 'idle' | 'requesting' | 'listening' | 'stopping';

export type DictationErrorCode =
  /** Permissão negada; dá para pedir de novo num próximo toque. */
  | 'denied'
  /** Permissão negada de vez: a tela oferece abrir os Ajustes. */
  | 'blocked'
  /** Reconhecimento de fala indisponível neste aparelho ou idioma. */
  | 'unavailable'
  | 'no-speech'
  | 'network'
  | 'busy'
  /** Ligação, Siri ou app em segundo plano cortaram a gravação. */
  | 'interrupted'
  | 'failed';

export type DictationError = {
  code: DictationErrorCode;
  /** Mensagem pronta para a interface, em português. */
  message: string;
};

export type DictationStartOptions = {
  /** Identifica a resposta que recebe o texto (o id da pergunta). */
  sessionKey: string;
  /** Texto que já estava no campo. O ditado acrescenta ao final, nunca substitui. */
  initialText: string;
  /** Limite de caracteres do campo. Ao atingir, o ditado para sozinho. */
  maxLength: number;
};

/**
 * Recebe o texto completo do campo (texto inicial + fala), já cortado em
 * `maxLength`. Chamado a cada resultado parcial e uma vez no fim, com
 * `isFinal: true`. Nunca chega depois de `cancel()`.
 */
export type DictationTextHandler = (sessionKey: string, text: string, isFinal: boolean) => void;

export type VoiceDictation = {
  /** `false` quando o aparelho não tem reconhecimento de fala: a tela mostra só a escrita. */
  supported: boolean;
  status: DictationStatus;
  /** Nível do áudio normalizado entre 0 e 1, para animar na thread de UI. */
  level: SharedValue<number>;
  /** Momento (ms, `Date.now()`) em que a escuta começou; `null` fora de `listening`. */
  startedAt: number | null;
  error: DictationError | null;
  /** Pede permissão se preciso e começa a ouvir. Não faz nada se já estiver ouvindo. */
  start: (options: DictationStartOptions) => Promise<void>;
  /**
   * Para de ouvir e resolve quando o texto final foi entregue a `onText` (ou após
   * um tempo limite curto, mantendo o último parcial). Seguro chamar em qualquer estado.
   */
  stop: () => Promise<void>;
  /** Descarta a sessão sem entregar mais texto. Usado ao sair da tela. */
  cancel: () => void;
  clearError: () => void;
};
