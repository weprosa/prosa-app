import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Screen, spacing, Text, Wordmark } from '@/design-system';

import { AuthFooter } from './components/auth-footer';

export function WelcomeScreen() {
  return (
    <Screen>
      <View style={styles.brand}>
        <Wordmark />
      </View>

      <View style={styles.hero}>
        <Text variant="display" accessibilityRole="header">
          Antes da “aparência”,{'\n'}
          <Text variant="displayItalic" color="primary">
            a pessoa.
          </Text>
        </Text>
        <Text color="textSecondary">O último app de relacionamento que você vai usar na vida.</Text>
      </View>

      <View style={styles.actions}>
        <Button label="Começar" onPress={() => router.push('/sign-up')} />
        <AuthFooter
          prompt="Já tem conta?"
          action="Entrar"
          onPress={() => router.push('/sign-in')}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  brand: { paddingTop: spacing.xl },
  hero: { flex: 1, justifyContent: 'center', gap: spacing.lg },
  actions: { gap: spacing.lg },
});
