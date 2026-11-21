import * as Haptics from 'expo-haptics';
import { ExpoSpeechRecognitionModule, useSpeechRecognitionEvent } from 'expo-speech-recognition';
import { useEffect, useRef, useState } from 'react';
import { Platform } from 'react-native';
import { useSharedValue } from 'react-native-reanimated';

import { ensureSpeechPermission } from '@/lib/permissions';
import type {
  DictationError,
  DictationErrorCode,
  DictationStartOptions,
  DictationStatus,
  DictationTextHandler,
  VoiceDictation,
} from '@/lib/voice-dictation-types';

const STOP_TIMEOUT = 2500;
const INITIAL_SILENCE_TIMEOUT = 10_000;
const SILENCE_TIMEOUT = 8000;

const ERROR_MESSAGES: Record<DictationErrorCode, string> = {
  denied: 'Para responder falando, permita o uso do microfone.',
  blocked: 'O acesso ao microfone está desligado. Ative nos Ajustes ou escreva sua resposta.',
  unavailable:
    'Responder falando não está disponível neste aparelho. Você pode escrever sua resposta.',
  'no-speech': 'Não ouvi nada. Toque no microfone e fale de novo.',
  network:
    'Sem internet, o reconhecimento de fala deste aparelho não funciona. Confira a conexão ou escreva sua resposta.',
  busy: 'O reconhecimento de fala está ocupado. Espere um instante e tente de novo.',
  interrupted:
    'A gravação foi interrompida. Seu texto ficou salvo; toque no microfone para continuar.',
  failed: 'Não deu para transformar sua fala em texto. Tente de novo ou escreva.',
};

type Session = {
  id: number;
  key: string;
  initialText: string;
  maxLength: number;
  committed: string;
  interim: string;
  lastText: string;
};

type NativeRun = {
  id: number;
  aborting: boolean;
  ended: Promise<void>;
  resolve: () => void;
};

type StopWait = {
  promise: Promise<void>;
  resolve: () => void;
  timer: ReturnType<typeof setTimeout>;
};

function isSupported(): boolean {
  try {
    return ExpoSpeechRecognitionModule.isRecognitionAvailable();
  } catch {
    return false;
  }
}

function makeNativeRun(id: number): NativeRun {
  let resolve = () => {};
  const ended = new Promise<void>((done) => {
    resolve = done;
  });
  return { id, aborting: false, ended, resolve };
}

function joinText(left: string, right: string): string {
  const prefix = left.trimEnd();
  const suffix = right.trimStart();
  return prefix && suffix ? `${prefix} ${suffix}` : prefix || suffix;
}

function errorCode(code: string): DictationErrorCode {
  switch (code) {
    case 'service-not-allowed':
    case 'language-not-supported':
      return 'unavailable';
    case 'network':
      return 'network';
    case 'no-speech':
    case 'speech-timeout':
      return 'no-speech';
    case 'busy':
      return 'busy';
    case 'interrupted':
    case 'audio-capture':
      return 'interrupted';
    case 'not-allowed':
      return 'denied';
    default:
      return 'failed';
  }
}

function haptic(): void {
  void Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light).catch(() => {});
}

export function useVoiceDictation(onText: DictationTextHandler): VoiceDictation {
  const [supported] = useState(isSupported);
  const [status, setStatus] = useState<DictationStatus>('idle');
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [error, setError] = useState<DictationError | null>(null);
  const level = useSharedValue(0);
  const onTextRef = useRef(onText);
  const mountedRef = useRef(true);
  const runtimeRef = useRef<{
    id: number;
    status: DictationStatus;
    session: Session | null;
    nativeRun: NativeRun | null;
    stopWait: StopWait | null;
    silenceTimer: ReturnType<typeof setTimeout> | null;
  }>({
    id: 0,
    status: 'idle',
    session: null,
    nativeRun: null,
    stopWait: null,
    silenceTimer: null,
  });

  useEffect(() => {
    onTextRef.current = onText;
  }, [onText]);

  function changeStatus(next: DictationStatus): void {
    const runtime = runtimeRef.current;
    if (runtime.status === 'listening' && next !== 'listening') haptic();
    runtime.status = next;
    if (next !== 'listening') {
      level.set(0);
      if (mountedRef.current) setStartedAt(null);
    }
    if (mountedRef.current) setStatus(next);
  }

  function reportError(code: DictationErrorCode): void {
    if (mountedRef.current) setError({ code, message: ERROR_MESSAGES[code] });
  }

  function clearSilenceTimer(): void {
    const runtime = runtimeRef.current;
    if (runtime.silenceTimer !== null) clearTimeout(runtime.silenceTimer);
    runtime.silenceTimer = null;
  }

  function resolveStop(): (() => void) | undefined {
    const runtime = runtimeRef.current;
    const wait = runtime.stopWait;
    runtime.stopWait = null;
    if (wait) clearTimeout(wait.timer);
    return wait?.resolve;
  }

  function finish(id: number): void {
    const runtime = runtimeRef.current;
    const session = runtime.session;
    if (!session || session.id !== id || runtime.id !== id) return;
    clearSilenceTimer();
    runtime.session = null;
    const resolve = resolveStop();
    changeStatus('idle');
    try {
      if (mountedRef.current) onTextRef.current(session.key, session.lastText, true);
    } finally {
      resolve?.();
    }
  }

  function abortNative(): void {
    const runtime = runtimeRef.current;
    // Os eventos não têm id. Uma nova escuta espera o `end` da anterior.
    // Na web, abortar sem reconhecedor não emite `end` e não precisa de espera.
    if (!runtime.nativeRun && Platform.OS !== 'web') {
      runtime.nativeRun = makeNativeRun(runtime.id);
    }
    if (runtime.nativeRun?.aborting) return;
    if (runtime.nativeRun) runtime.nativeRun.aborting = true;
    try {
      ExpoSpeechRecognitionModule.abort();
    } catch {
      // Se o módulo falhar, a próxima tentativa informa que o serviço está ocupado.
    }
  }

  function cancel(): void {
    const runtime = runtimeRef.current;
    runtime.id += 1;
    runtime.session = null;
    clearSilenceTimer();
    const resolve = resolveStop();
    changeStatus('idle');
    if (mountedRef.current) setError(null);
    abortNative();
    resolve?.();
  }

  function stop(): Promise<void> {
    const runtime = runtimeRef.current;
    if (runtime.stopWait) return runtime.stopWait.promise;
    if (runtime.status === 'requesting') {
      cancel();
      return Promise.resolve();
    }
    const session = runtime.session;
    if (runtime.status !== 'listening' || !session) return Promise.resolve();

    clearSilenceTimer();
    changeStatus('stopping');
    let resolve = () => {};
    const promise = new Promise<void>((done) => {
      resolve = done;
    });
    const timer = setTimeout(() => {
      if (runtimeRef.current.id !== session.id) return;
      finish(session.id);
      abortNative();
    }, STOP_TIMEOUT);
    runtime.stopWait = { promise, resolve, timer };
    try {
      ExpoSpeechRecognitionModule.stop();
    } catch {
      reportError('failed');
      finish(session.id);
      abortNative();
    }
    return promise;
  }

  function armSilenceTimer(session: Session, delay: number): void {
    clearSilenceTimer();
    if (runtimeRef.current.status !== 'listening') return;
    runtimeRef.current.silenceTimer = setTimeout(() => {
      const runtime = runtimeRef.current;
      if (runtime.id !== session.id || runtime.session !== session) return;
      if (!session.committed && !session.interim) reportError('no-speech');
      void stop();
    }, delay);
  }

  async function start(options: DictationStartOptions): Promise<void> {
    const runtime = runtimeRef.current;
    if (!mountedRef.current || runtime.status !== 'idle') return;
    const id = ++runtime.id;
    changeStatus('requesting');
    setError(null);
    try {
      const permission = await ensureSpeechPermission();
      if (runtime.id !== id || !mountedRef.current) return;
      if (permission !== 'granted') {
        reportError(permission);
        changeStatus('idle');
        return;
      }
      if (!supported) {
        reportError('unavailable');
        changeStatus('idle');
        return;
      }

      // Cancelamento e timeout podem devolver a interface antes do encerramento nativo.
      const previousRun = runtime.nativeRun;
      if (previousRun) {
        let timer: ReturnType<typeof setTimeout> | undefined;
        try {
          await Promise.race([
            previousRun.ended,
            new Promise<void>((resolve) => {
              timer = setTimeout(resolve, STOP_TIMEOUT);
            }),
          ]);
        } finally {
          clearTimeout(timer);
        }
        if (runtime.id !== id || !mountedRef.current) return;
        if (runtime.nativeRun) {
          reportError('busy');
          changeStatus('idle');
          return;
        }
      }

      const initialText = options.initialText.trimEnd();
      const session: Session = {
        id,
        key: options.sessionKey,
        initialText,
        maxLength: Math.max(0, options.maxLength),
        committed: '',
        interim: '',
        lastText: Array.from(initialText).slice(0, Math.max(0, options.maxLength)).join(''),
      };
      runtime.session = session;
      runtime.nativeRun = makeNativeRun(id);
      ExpoSpeechRecognitionModule.start({
        lang: 'pt-BR',
        interimResults: true,
        continuous: true,
        addsPunctuation: true,
        maxAlternatives: 1,
        iosTaskHint: 'dictation',
        requiresOnDeviceRecognition: false,
        volumeChangeEventOptions: { enabled: true, intervalMillis: 100 },
        recordingOptions: { persist: false },
      });
    } catch {
      if (runtime.id !== id || !mountedRef.current) return;
      reportError('failed');
      if (runtime.session) {
        finish(id);
        abortNative();
      } else {
        changeStatus('idle');
      }
    }
  }

  function activeSession(): Session | null {
    const runtime = runtimeRef.current;
    const session = runtime.session;
    return mountedRef.current && session?.id === runtime.id && runtime.nativeRun?.id === session.id
      ? session
      : null;
  }

  useSpeechRecognitionEvent('start', () => {
    const session = activeSession();
    if (!session || runtimeRef.current.status !== 'requesting') return;
    changeStatus('listening');
    setStartedAt(Date.now());
    haptic();
    armSilenceTimer(session, INITIAL_SILENCE_TIMEOUT);
    if (Array.from(session.lastText).length >= session.maxLength) void stop();
  });

  useSpeechRecognitionEvent('result', (event) => {
    const session = activeSession();
    if (!session) return;
    armSilenceTimer(session, SILENCE_TIMEOUT);
    const transcript = event.results[0]?.transcript;
    if (transcript === undefined) return;
    if (event.isFinal) {
      session.committed = joinText(session.committed, transcript.trim());
      session.interim = '';
    } else {
      session.interim = transcript.trim();
    }
    const characters = Array.from(
      joinText(session.initialText, joinText(session.committed, session.interim)),
    );
    const text = characters.slice(0, session.maxLength).join('');
    if (text !== session.lastText) {
      session.lastText = text;
      onTextRef.current(session.key, text, false);
    }
    if (runtimeRef.current.id === session.id && characters.length >= session.maxLength) void stop();
  });

  useSpeechRecognitionEvent('end', () => {
    const runtime = runtimeRef.current;
    const session = activeSession();
    const nativeRun = runtime.nativeRun;
    runtime.nativeRun = null;
    nativeRun?.resolve();
    if (!session) return;
    if (!session.committed && !session.interim) reportError('no-speech');
    finish(session.id);
  });

  useSpeechRecognitionEvent('error', (event) => {
    if (event.error === 'aborted') return;
    const session = activeSession();
    if (!session) return;
    reportError(errorCode(event.error));
    finish(session.id);
    if (event.error === 'not-allowed') {
      void ExpoSpeechRecognitionModule.getPermissionsAsync()
        .then((permission) => {
          if (runtimeRef.current.id === session.id) {
            reportError(permission.canAskAgain ? 'denied' : 'blocked');
          }
        })
        .catch(() => {});
    }
  });

  useSpeechRecognitionEvent('volumechange', ({ value }) => {
    if (activeSession() && runtimeRef.current.status === 'listening') {
      level.set(Number.isFinite(value) ? Math.max(0, Math.min(1, (value + 2) / 12)) : 0);
    }
  });

  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      cancel();
    };
    // O cancelamento lê apenas refs e o shared value estável, sem capturar estado de sessão.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return {
    supported,
    status,
    level,
    startedAt,
    error,
    start,
    stop,
    cancel,
    clearError: () => setError(null),
  };
}
