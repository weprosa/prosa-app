import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../tokens';
import { Text } from './text';

export type NoticeProps = {
  message: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

/** Aviso de apoio que permanece junto ao conteúdo, com ícone decorativo opcional. */
export function Notice({ message, icon }: NoticeProps) {
  return (
    <View style={styles.container}>
      {icon ? (
        <Ionicons
          name={icon}
          size={18}
          color={colors.text}
          accessible={false}
          importantForAccessibility="no"
        />
      ) : null}
      <Text variant="bodySmall" color="textSecondary" style={styles.message}>
        {message}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.surface,
    borderRadius: radii.field,
    padding: spacing.md,
    gap: spacing.sm,
  },
  message: { flex: 1 },
});
