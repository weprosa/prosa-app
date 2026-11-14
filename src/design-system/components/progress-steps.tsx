import { StyleSheet, View } from 'react-native';

import { colors, radii, spacing } from '../tokens';

export type ProgressStepsProps = {
  /** Etapa atual, começando em 1. */
  current: number;
  total: number;
};

/** Barra segmentada de um fluxo em etapas. A etapa atual e as anteriores ficam preenchidas. */
export function ProgressSteps({ current, total }: ProgressStepsProps) {
  return (
    <View
      style={styles.row}
      accessibilityRole="progressbar"
      accessibilityLabel={`Etapa ${current} de ${total}`}
      accessibilityValue={{ min: 1, max: total, now: current }}
    >
      {Array.from({ length: total }, (_, index) => (
        <View key={index} style={[styles.segment, index < current && styles.done]} />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', gap: spacing.xs },
  segment: { flex: 1, height: 4, borderRadius: radii.pill, backgroundColor: colors.track },
  done: { backgroundColor: colors.primary },
});
