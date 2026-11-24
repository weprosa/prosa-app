import { useMutation } from '@tanstack/react-query';
import { router } from 'expo-router';
import { StyleSheet, View } from 'react-native';

import { Button, Divider, showToast, spacing } from '@/design-system';

import { authErrorMessage, signInWithGoogle } from '../auth-service';

export function SocialSignIn() {
  const mutation = useMutation({
    mutationFn: signInWithGoogle,
    onSuccess: (user) => {
      if (user) router.replace('/onboarding');
    },
    onError: (error) => showToast({ tone: 'error', title: authErrorMessage(error) }),
  });

  const signInWithApple = () => {};

  return (
    <View style={styles.container}>
      <Divider label="ou" />
      <Button
        variant="secondary"
        label="Continuar com Google"
        loading={mutation.isPending}
        onPress={() => mutation.mutate()}
      />
      <Button variant="secondary" label="Continuar com Apple" onPress={signInWithApple} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
});
