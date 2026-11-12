import { StyleSheet, View } from 'react-native';

import { colors, spacing } from '../tokens';
import { Text } from './text';

/** Linha separadora, com rótulo opcional no meio ("ou"). */
export function Divider({ label }: { label?: string }) {
  if (!label) return <View style={styles.line} />;

  return (
    <View style={styles.row}>
      <View style={styles.line} />
      <Text variant="bodySmall" color="textSecondary">
        {label}
      </Text>
      <View style={styles.line} />
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: spacing.md },
  line: { flex: 1, height: 1, backgroundColor: colors.divider },
});
