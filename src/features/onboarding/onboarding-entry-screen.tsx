import { router } from 'expo-router';
import { useEffect } from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';

import { Button, colors, Notice, Screen, spacing } from '@/design-system';
import { nextOnboardingHref } from '@/features/onboarding/steps';
import { useOnboarding } from '@/features/onboarding/use-onboarding';

/** Decide em qual etapa a pessoa retoma o onboarding, a partir do que já está salvo. */
export function OnboardingEntryScreen() {
  const { data: user, isError, isFetching, refetch } = useOnboarding();

  useEffect(() => {
    if (user) router.replace(nextOnboardingHref(user));
  }, [user]);

  return (
    <Screen>
      <View style={styles.content}>
        {isError && !isFetching ? (
          <>
            <Notice message="Não foi possível carregar seus dados. Confira sua internet e tente de novo." />
            <Button label="Tentar de novo" onPress={() => void refetch()} />
          </>
        ) : (
          <ActivityIndicator color={colors.primary} accessibilityLabel="Carregando seus dados" />
        )}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  content: { flex: 1, justifyContent: 'center', gap: spacing.md },
});
