import { StyleSheet, View } from 'react-native';

import { Button, Divider, spacing } from '@/design-system';

export function SocialSignIn() {
  // TODO: ligar ao login social quando o back-end definir o fluxo OAuth (docs/adr/0008).
  const signInWithGoogle = () => {};
  const signInWithApple = () => {};

  return (
    <View style={styles.container}>
      <Divider label="ou" />
      <Button variant="secondary" label="Continuar com Google" onPress={signInWithGoogle} />
      <Button variant="secondary" label="Continuar com Apple" onPress={signInWithApple} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.sm },
});
