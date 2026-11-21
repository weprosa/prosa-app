import { router } from 'expo-router';
import { Fragment, useRef } from 'react';
import { StyleSheet, View } from 'react-native';

import {
  Button,
  Divider,
  IconButton,
  Notice,
  Screen,
  showToast,
  sizes,
  spacing,
  Text,
  TextButton,
} from '@/design-system';

import { STORY_CHAPTERS } from '@/features/onboarding/story/chapters';
import { useCompleteStory } from '@/features/onboarding/story/use-story';

export function StoryIntroScreen() {
  const completeStory = useCompleteStory();
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/onboarding/profile'));

  // Trava síncrona contra toque duplo antes do próximo render.
  const skipping = useRef(false);

  const skipStory = () => {
    if (skipping.current) return;
    skipping.current = true;

    completeStory.mutate(undefined, {
      onSettled: () => {
        skipping.current = false;
      },
      onSuccess: () => router.replace('/onboarding/story/done'),
      onError: () => {
        showToast({
          tone: 'error',
          title: 'Não deu para continuar',
          message: 'Confira sua conexão e tente de novo.',
        });
      },
    });
  };

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <IconButton
          icon="chevron-back"
          accessibilityLabel="Voltar"
          onPress={goBack}
          disabled={completeStory.isPending}
        />
      </View>

      <View style={styles.header}>
        <Text variant="title" accessibilityRole="header">
          Agora é a sua vez de contar
        </Text>
        <Text color="textSecondary">
          São {STORY_CHAPTERS.length} capítulos com perguntas abertas. Você pode escrever ou falar.
          Pode pular qualquer pergunta ou o capítulo inteiro se quiser.
        </Text>
      </View>

      <View>
        <Divider />
        {STORY_CHAPTERS.map((chapter, index) => (
          <Fragment key={chapter.id}>
            <View style={styles.chapter}>
              <Text variant="heading" color="link" style={styles.number}>
                {index + 1}
              </Text>
              <Text variant="heading">{chapter.title}</Text>
            </View>
            <Divider />
          </Fragment>
        ))}
      </View>

      <View style={styles.footer}>
        <Notice
          icon="lock-closed-outline"
          message="Suas respostas ficam privadas. Você pode voltar e editar depois."
        />
        <Button
          label="Começar"
          onPress={() => router.push('/onboarding/story/questions')}
          disabled={completeStory.isPending}
        />
        <TextButton
          label="Pular essa etapa"
          onPress={skipStory}
          disabled={completeStory.isPending}
          accessibilityState={{ disabled: completeStory.isPending }}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { width: sizes.touchTarget, marginLeft: -spacing.sm, marginBottom: spacing.xs },
  header: { gap: spacing.xxs, marginTop: spacing.lg, marginBottom: spacing.lg },
  chapter: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.md,
    gap: spacing.md,
  },
  // Coluna fixa: os numerais têm larguras diferentes e os títulos precisam alinhar.
  number: { width: spacing.xl },
  footer: { flex: 1, justifyContent: 'flex-end', paddingTop: spacing.xl, gap: spacing.md },
});
