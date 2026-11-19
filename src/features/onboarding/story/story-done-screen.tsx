import { Image } from 'expo-image';
import { Stack, useIsFocused } from 'expo-router';
import { useEffect } from 'react';
import { BackHandler, StyleSheet, View } from 'react-native';

import { Button, Screen, showToast, spacing, Text } from '@/design-system';

const ILLUSTRATION = { width: 136, height: 96 };

export function StoryDoneScreen() {
  const isFocused = useIsFocused();

  useEffect(() => {
    if (!isFocused) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [isFocused]);

  const viewMatches = () => {
    // TODO: navegar para a futura rota de matches quando ela existir.
    showToast({
      tone: 'success',
      title: 'Seu perfil está pronto',
      message: 'A lista de matches chega em breve.',
    });
  };

  return (
    <Screen>
      {/* Sem gesto de voltar no iOS: o fluxo da narrativa já terminou. */}
      <Stack.Screen options={{ gestureEnabled: false }} />
      <View style={styles.body}>
        <Image
          source={require('../../../../assets/images/story-done.svg')}
          style={styles.illustration}
          accessible={false}
        />
        <View style={styles.header}>
          <Text variant="title" align="center" accessibilityRole="header">
            Tudo pronto
          </Text>
          <Text color="textSecondary" align="center">
            Agora a gente vai encontrar pessoas que combinam com o que você contou.
          </Text>
        </View>
      </View>
      <View style={styles.footer}>
        <Button label="Ver meus matches" onPress={viewMatches} />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: { flex: 1, justifyContent: 'center', alignItems: 'center', gap: spacing.lg },
  illustration: { width: ILLUSTRATION.width, height: ILLUSTRATION.height },
  header: { gap: spacing.xxs },
  footer: { paddingTop: spacing.xl },
});
