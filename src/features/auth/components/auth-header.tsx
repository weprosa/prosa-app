import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { IconButton, spacing, Text } from '@/design-system';

type AuthHeaderProps = { title: string; subtitle?: string };

export function AuthHeader({ title, subtitle }: AuthHeaderProps) {
  const goBack = () => (router.canGoBack() ? router.back() : router.replace('/'));

  return (
    <View style={styles.container}>
      <View style={styles.back}>
        <IconButton icon="chevron-back" accessibilityLabel="Voltar" onPress={goBack} />
      </View>
      <Text variant="title" accessibilityRole="header">
        {title}
      </Text>
      {subtitle ? (
        <Text color="textSecondary" style={styles.subtitle}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { marginBottom: spacing.lg },
  // Alinha o traço do ícone, e não a área de toque, com a margem do texto.
  back: { marginLeft: -spacing.sm, marginBottom: spacing.xs },
  subtitle: { marginTop: spacing.xxs },
});
