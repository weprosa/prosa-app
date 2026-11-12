import { StyleSheet, View } from 'react-native';

import { spacing, Text, TextLink } from '@/design-system';

type AuthFooterProps = { prompt: string; action: string; onPress: () => void };

/** Linha "Já tem conta? Entrar" no pé das telas de entrada. */
export function AuthFooter({ prompt, action, onPress }: AuthFooterProps) {
  return (
    <View style={styles.row}>
      <Text variant="bodySmall" color="textSecondary">
        {prompt}
      </Text>
      <TextLink label={action} onPress={onPress} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.xxs + 2,
  },
});
