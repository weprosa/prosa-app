import { Image } from 'expo-image';
import { Stack, useIsFocused } from 'expo-router';
import { useEffect, useRef, useState } from 'react';
import { BackHandler, Linking, StyleSheet, View } from 'react-native';

import { Button, Notice, Screen, showToast, spacing, Text, TextButton } from '@/design-system';
import { syncLocation } from '@/lib/location-sync';

const ILLUSTRATION = { width: 136, height: 96 };
const CITY_FALLBACK_MESSAGE = 'Sem sua localização, vamos usar a cidade do seu perfil.';
const LOCATION_RETRY_MESSAGE =
  'Não deu para ler ou enviar sua localização agora. Vamos tentar de novo quando você abrir o app.';

export function StoryDoneScreen() {
  const isFocused = useIsFocused();
  const [locating, setLocating] = useState(false);
  const [locationBlocked, setLocationBlocked] = useState(false);
  const locationRequest = useRef<AbortController | null>(null);

  useEffect(() => {
    return () => locationRequest.current?.abort();
  }, []);

  useEffect(() => {
    if (!isFocused) return;

    const subscription = BackHandler.addEventListener('hardwareBackPress', () => true);
    return () => subscription.remove();
  }, [isFocused]);

  function completeOnboarding(message = 'A lista de matches chega em breve.') {
    // TODO: navegar para a futura rota de matches quando ela existir.
    showToast({
      tone: 'success',
      title: 'Seu perfil está pronto',
      message,
    });
  }

  async function viewMatches() {
    if (locationRequest.current) return;

    const controller = new AbortController();
    locationRequest.current = controller;
    setLocating(true);

    try {
      const result = await syncLocation({ prompt: true, force: true, signal: controller.signal });
      if (controller.signal.aborted) return;

      setLocationBlocked(result.status === 'blocked');
      switch (result.status) {
        case 'sent':
        case 'unchanged':
        case 'no-session':
          completeOnboarding();
          break;
        case 'denied':
          completeOnboarding(CITY_FALLBACK_MESSAGE);
          break;
        case 'blocked':
          break;
        case 'unavailable':
        case 'failed':
          completeOnboarding(LOCATION_RETRY_MESSAGE);
          break;
      }
    } finally {
      locationRequest.current = null;
      if (!controller.signal.aborted) setLocating(false);
    }
  }

  async function openLocationSettings() {
    try {
      await Linking.openSettings();
    } catch {
      showToast({
        tone: 'error',
        title: 'Não deu para abrir os Ajustes',
        message: 'Abra os Ajustes do aparelho para permitir a localização ou continue sem ela.',
      });
    }
  }

  return (
    <Screen scroll>
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
        {locationBlocked ? (
          <View accessibilityLiveRegion="polite">
            <Notice
              icon="location-outline"
              message="Sua localização está desligada nos Ajustes. Você pode permitir o acesso ou continuar usando a cidade do seu perfil."
            />
            <TextButton
              label="Abrir Ajustes"
              disabled={locating}
              onPress={() => void openLocationSettings()}
            />
          </View>
        ) : (
          <Text variant="bodySmall" color="textSecondary" align="center">
            Para mostrar pessoas perto de você, vamos pedir sua localização. Usamos só a região
            aproximada.
          </Text>
        )}
        <Button label="Ver meus matches" loading={locating} onPress={() => void viewMatches()} />
        {locationBlocked ? (
          <TextButton
            label="Continuar sem localização"
            disabled={locating}
            onPress={() => {
              if (!locationRequest.current) completeOnboarding(CITY_FALLBACK_MESSAGE);
            }}
          />
        ) : null}
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.lg,
    paddingVertical: spacing.lg,
  },
  illustration: { width: ILLUSTRATION.width, height: ILLUSTRATION.height },
  header: { gap: spacing.xxs },
  footer: { paddingTop: spacing.xl, gap: spacing.md },
});
