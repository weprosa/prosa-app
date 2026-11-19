import { router, useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';
import Animated, { FadeIn } from 'react-native-reanimated';

import {
  Button,
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

type AnswerMode = 'write' | 'speak';
type Position = { chapterIndex: number; questionIndex: number };

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
  const [drafts, setDrafts] = useState<Partial<Record<StoryQuestionId, string>>>({});
  const [mode, setMode] = useState<AnswerMode>('write');
  const story = useStory();
  const saveStoryAnswers = useSaveStoryAnswers();
  const completeStory = useCompleteStory();
  const isFocused = useIsFocused();
  const serverAnswers = answersByQuestion(story.data);
  const chapter = STORY_CHAPTERS[position.chapterIndex];
  const question = chapter.questions[position.questionIndex];
  const isLastChapter = position.chapterIndex === STORY_CHAPTERS.length - 1;
  const isLastQuestion = position.questionIndex === chapter.questions.length - 1;
  const isPending = saveStoryAnswers.isPending || completeStory.isPending;
  // Trava síncrona: dois toques antes do próximo render ainda veem `isPending` falso.
  const saving = useRef(false);

  useEffect(() => {
    if (!isFocused) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => {
      if (!isPending) goBack(position, setPosition);
      return true;
    });
    return () => subscription.remove();
  }, [isFocused, isPending, position]);

  const finishChapter = async () => {
    if (saving.current) return;
    saving.current = true;

    const answers: StoryAnswer[] = [];
    for (const { id } of chapter.questions) {
      const text = (drafts[id] ?? serverAnswers[id] ?? '').trim();
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
    } finally {
      saving.current = false;
    }
  };

  const nextQuestion = () => {
    if (isPending) return;
    if (isLastQuestion) {
      void finishChapter();
    } else {
      setPosition({ ...position, questionIndex: position.questionIndex + 1 });
    }
  };

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <View style={styles.back}>
          <IconButton
            icon="chevron-back"
            accessibilityLabel="Voltar"
            onPress={() => goBack(position, setPosition)}
            disabled={isPending}
          />
        </View>
        <TextButton
          label="Pular capítulo"
          tone="muted"
          onPress={() => void finishChapter()}
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
          onChange={setMode}
        />
        {mode === 'write' ? (
          <TextArea
            fill
            accessibilityLabel={question.prompt}
            placeholder="Escreva com calma, do seu jeito..."
            value={drafts[question.id] ?? serverAnswers[question.id] ?? ''}
            onChangeText={(text) => setDrafts((previous) => ({ ...previous, [question.id]: text }))}
            maxLength={STORY_ANSWER_MAX_LENGTH}
            autoCapitalize="sentences"
            hint="Sem resposta certa. Se preferir, pode seguir sem responder."
            editable={!isPending}
          />
        ) : (
          <Notice
            icon="mic-outline"
            message="Responder falando chega em breve. Por enquanto, escreva sua resposta."
          />
        )}
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
  footer: { paddingTop: spacing.xl },
});
