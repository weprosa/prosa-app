import { router, useIsFocused } from 'expo-router';
import { useEffect, useEffectEvent, useRef, useState } from 'react';
import { BackHandler, Keyboard, Linking, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  Button,
  DictationButton,
  IconButton,
  Notice,
  ProgressSteps,
  Screen,
  SegmentedControl,
  showToast,
  sizes,
  spacing,
  Text,
  TextArea,
  TextButton,
  type SegmentedOption,
} from '@/design-system';

import {
  STORY_ANSWER_MAX_LENGTH,
  STORY_CHAPTERS,
  type StoryQuestionId,
} from '@/features/onboarding/story/chapters';
import type { StoryAnswer } from '@/features/onboarding/story/story-service';
import {
  answersByQuestion,
  useCompleteStory,
  useSaveStoryAnswers,
  useStory,
} from '@/features/onboarding/story/use-story';
import { STORY_HREF } from '@/features/onboarding/steps';
import { useVoiceDictation } from '@/lib/voice-dictation';

type AnswerMode = 'write' | 'speak';
type Position = { chapterIndex: number; questionIndex: number };
type StoryDrafts = Partial<Record<StoryQuestionId, string>>;

const ANSWER_MODES = [
  { value: 'write', label: 'Escrever', icon: 'create-outline' },
  { value: 'speak', label: 'Falar', icon: 'mic-outline' },
] as const satisfies readonly SegmentedOption<AnswerMode>[];

function goBack(position: Position, setPosition: (position: Position) => void) {
  if (position.questionIndex > 0) {
    setPosition({ ...position, questionIndex: position.questionIndex - 1 });
  } else if (position.chapterIndex > 0) {
    const chapterIndex = position.chapterIndex - 1;
    setPosition({ chapterIndex, questionIndex: STORY_CHAPTERS[chapterIndex].questions.length - 1 });
  } else if (router.canGoBack()) {
    router.back();
  } else {
    router.replace(STORY_HREF);
  }
}

export function StoryQuestionsScreen() {
  const [position, setPosition] = useState<Position>({ chapterIndex: 0, questionIndex: 0 });
  const [drafts, setDraftState] = useState<StoryDrafts>({});
  const draftsRef = useRef<StoryDrafts>({});
  const [mode, setMode] = useState<AnswerMode>('write');
  const [transitioning, setTransitioning] = useState(false);
  const [now, setNow] = useState(Date.now);
  // Leitura síncrona após stop(): o resultado final pode preceder o próximo render.
  function setDrafts(update: (previous: StoryDrafts) => StoryDrafts) {
    const next = update(draftsRef.current);
    draftsRef.current = next;
    setDraftState(next);
  }
  const dictation = useVoiceDictation((key, text) =>
    setDrafts((previous) => ({ ...previous, [key as StoryQuestionId]: text })),
  );
  const story = useStory();
  const saveStoryAnswers = useSaveStoryAnswers();
  const completeStory = useCompleteStory();
  const isFocused = useIsFocused();
  const serverAnswers = answersByQuestion(story.data);
  const chapter = STORY_CHAPTERS[position.chapterIndex];
  const question = chapter.questions[position.questionIndex];
  const isLastChapter = position.chapterIndex === STORY_CHAPTERS.length - 1;
  const isLastQuestion = position.questionIndex === chapter.questions.length - 1;
  const isPending = transitioning || saveStoryAnswers.isPending || completeStory.isPending;
  const listening = dictation.status === 'listening';
  const dictationBusy = dictation.status === 'requesting' || dictation.status === 'stopping';
  const currentText = drafts[question.id] ?? serverAnswers[question.id] ?? '';
  const elapsedSeconds =
    listening && dictation.startedAt !== null
      ? Math.max(0, Math.floor((now - dictation.startedAt) / 1000))
      : 0;
  const elapsed = `${Math.floor(elapsedSeconds / 60)}:${String(elapsedSeconds % 60).padStart(2, '0')}`;
  const dictationStatus =
    dictation.status === 'requesting'
      ? 'Preparando o microfone…'
      : listening
        ? `Ouvindo… toque para parar · ${elapsed}`
        : dictation.status === 'stopping'
          ? 'Finalizando seu texto…'
          : currentText.trim()
            ? 'Toque no microfone para continuar falando.'
            : 'Toque no microfone e fale. Sua resposta aparece aqui e você pode editar depois.';
  // Trava síncrona: dois toques antes do próximo render ainda veem `isPending` falso.
  const saving = useRef(false);

  useEffect(() => {
    if (!listening || dictation.startedAt === null) return;

    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [listening, dictation.startedAt]);

  async function transition(action: () => void | Promise<void>) {
    if (isPending || saving.current) return;
    saving.current = true;
    setTransitioning(true);
    try {
      await dictation.stop();
      await action();
    } finally {
      saving.current = false;
      setTransitioning(false);
    }
  }

  const onHardwareBack = useEffectEvent(() => {
    void transition(() => goBack(position, setPosition));
    return true;
  });

  useEffect(() => {
    if (!isFocused) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', onHardwareBack);
    return () => subscription.remove();
  }, [isFocused]);

  const finishChapter = async () => {
    const answers: StoryAnswer[] = [];
    for (const { id } of chapter.questions) {
      const text = (draftsRef.current[id] ?? serverAnswers[id] ?? '').trim();
      if (text !== (serverAnswers[id] ?? '')) answers.push({ question_id: id, text });
    }

    try {
      if (answers.length > 0) await saveStoryAnswers.mutateAsync(answers);

      if (isLastChapter) {
        await completeStory.mutateAsync();
        router.replace('/onboarding/story/done');
      } else {
        setPosition({ chapterIndex: position.chapterIndex + 1, questionIndex: 0 });
      }
    } catch {
      showToast({
        tone: 'error',
        title: 'Não deu para salvar',
        message: 'Confira sua conexão e tente de novo.',
      });
    }
  };

  const nextQuestion = () => {
    void transition(async () => {
      if (isLastQuestion) {
        await finishChapter();
      } else {
        setPosition({ ...position, questionIndex: position.questionIndex + 1 });
      }
    });
  };

  const changeMode = (nextMode: AnswerMode) => {
    if (nextMode === mode) return;
    void transition(() => {
      if (nextMode === 'write') dictation.clearError();
      setMode(nextMode);
    });
  };

  const toggleDictation = () => {
    if (isPending || saving.current || dictationBusy) return;
    if (listening) {
      void dictation.stop();
    } else {
      Keyboard.dismiss();
      dictation.clearError();
      void dictation.start({
        sessionKey: question.id,
        initialText: draftsRef.current[question.id] ?? serverAnswers[question.id] ?? '',
        maxLength: STORY_ANSWER_MAX_LENGTH,
      });
    }
  };

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <View style={styles.back}>
          <IconButton
            icon="chevron-back"
            accessibilityLabel="Voltar"
            onPress={() => void transition(() => goBack(position, setPosition))}
            disabled={isPending}
          />
        </View>
        <TextButton
          label="Pular capítulo"
          tone="muted"
          onPress={() => void transition(finishChapter)}
          disabled={isPending}
          accessibilityState={{ disabled: isPending }}
        />
      </View>

      <Text variant="bodySmall" color="textSecondary" style={styles.caption}>
        Capítulo {position.chapterIndex + 1} de {STORY_CHAPTERS.length} · Pergunta{' '}
        {position.questionIndex + 1} de {chapter.questions.length}
      </Text>
      <ProgressSteps current={position.questionIndex + 1} total={chapter.questions.length} />

      <View style={styles.body}>
        {/* Só o enunciado troca com animação; o campo mantém a identidade entre perguntas. */}
        <Animated.View key={question.id} entering={FadeIn.duration(200)} style={styles.header}>
          <Text variant="eyebrow" color="link">
            {chapter.title}
          </Text>
          <Text variant="title" accessibilityRole="header">
            {question.prompt}
          </Text>
        </Animated.View>
        <SegmentedControl
          accessibilityLabel="Como responder"
          options={ANSWER_MODES}
          value={mode}
          onChange={changeMode}
        />
        <TextArea
          fill
          accessibilityLabel={question.prompt}
          placeholder={
            mode === 'speak'
              ? 'O que você falar aparece aqui, em texto.'
              : 'Escreva com calma, do seu jeito...'
          }
          value={currentText}
          onChangeText={(text) => setDrafts((previous) => ({ ...previous, [question.id]: text }))}
          maxLength={STORY_ANSWER_MAX_LENGTH}
          autoCapitalize="sentences"
          hint="Sem resposta certa. Se preferir, pode seguir sem responder."
          editable={!isPending && !listening && dictation.status !== 'stopping'}
        />
        {mode === 'speak' ? (
          dictation.supported ? (
            <>
              <View style={styles.dictation}>
                <DictationButton
                  listening={listening}
                  busy={dictationBusy}
                  level={dictation.level}
                  onPress={toggleDictation}
                  disabled={isPending}
                  accessibilityLabel={listening ? 'Parar de falar' : 'Começar a falar'}
                />
                <Text
                  variant="bodySmall"
                  color="textSecondary"
                  align="center"
                  accessibilityLiveRegion="polite"
                >
                  {dictationStatus}
                </Text>
              </View>
              {dictation.error ? (
                <View style={styles.dictationError}>
                  <Notice icon="alert-circle-outline" message={dictation.error.message} />
                  {dictation.error.code === 'blocked' ? (
                    <TextButton
                      label="Abrir ajustes"
                      disabled={isPending}
                      onPress={() =>
                        void transition(async () => {
                          try {
                            await Linking.openSettings();
                          } catch {
                            showToast({
                              tone: 'error',
                              title: 'Não deu para abrir os ajustes',
                              message: 'Abra os ajustes do aparelho e procure o Prosa.',
                            });
                          }
                        })
                      }
                    />
                  ) : null}
                </View>
              ) : null}
            </>
          ) : (
            <View style={styles.dictationError}>
              <Notice message="Responder falando não está disponível neste aparelho. Você pode escrever sua resposta." />
              <TextButton
                label="Escrever resposta"
                disabled={isPending}
                onPress={() => changeMode('write')}
              />
            </View>
          )
        ) : null}
      </View>

      <View style={styles.footer}>
        <Button
          label={isLastChapter && isLastQuestion ? 'Concluir' : 'Próxima'}
          loading={isPending}
          onPress={nextQuestion}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: spacing.xs,
  },
  back: { width: sizes.touchTarget, marginLeft: -spacing.sm },
  caption: { marginBottom: spacing.sm },
  body: { flex: 1, gap: spacing.md, marginTop: spacing.lg },
  header: { gap: spacing.xxs },
  dictation: { alignItems: 'center', gap: spacing.xxs },
  dictationError: { gap: spacing.xxs },
  footer: { paddingTop: spacing.xl },
});
