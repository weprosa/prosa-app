import { router } from 'expo-router';
import type { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { Button, IconButton, ProgressSteps, Screen, sizes, spacing, Text } from '@/design-system';

import { stepPosition, type OnboardingStepId } from '../steps';

type OnboardingStepProps = {
  step: OnboardingStepId;
  title: string;
  subtitle?: string;
  children: ReactNode;
  /** Rótulo do botão principal. Padrão: "Continuar". */
  actionLabel?: string;
  onContinue: () => void;
  loading?: boolean;
};

/** Moldura comum a toda etapa do onboarding: voltar, "n de total", progresso, título e botão. */
export function OnboardingStep({
  step,
  title,
  subtitle,
  children,
  actionLabel = 'Continuar',
  onContinue,
  loading,
}: OnboardingStepProps) {
  const { current, total, previous } = stepPosition(step);
  const showBack = router.canGoBack() || previous !== undefined;
  const goBack = () => {
    if (router.canGoBack()) router.back();
    else if (previous) router.replace(previous.href);
  };

  return (
    <Screen scroll>
      <View style={styles.topBar}>
        <View style={styles.back}>
          {showBack ? (
            <IconButton icon="chevron-back" accessibilityLabel="Voltar" onPress={goBack} />
          ) : null}
        </View>
        <Text variant="bodySmall" color="textSecondary" style={styles.counter}>
          {current} de {total}
        </Text>
        <View style={styles.back} />
      </View>
      <ProgressSteps current={current} total={total} />

      <View style={styles.header}>
        <Text variant="title" accessibilityRole="header">
          {title}
        </Text>
        {subtitle ? <Text color="textSecondary">{subtitle}</Text> : null}
      </View>

      <View style={styles.body}>{children}</View>

      <View style={styles.footer}>
        <Button label={actionLabel} loading={loading} onPress={onContinue} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  topBar: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.xs },
  // Alinha o traço do ícone com a margem; a coluna vazia à direita centraliza o contador.
  back: { width: sizes.touchTarget, minHeight: sizes.touchTarget, marginLeft: -spacing.sm },
  counter: { flex: 1, textAlign: 'center' },
  header: { gap: spacing.xxs, marginTop: spacing.lg, marginBottom: spacing.lg },
  body: { gap: spacing.md },
  footer: { flex: 1, justifyContent: 'flex-end', paddingTop: spacing.xl },
});
