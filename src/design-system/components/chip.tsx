import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '../tokens';
import { Text } from './text';

export type ChipOption<T extends string> = { value: T; label: string };

export type ChipGroupProps<T extends string> = {
  label: string;
  options: readonly ChipOption<T>[];
  value: T | null;
  error?: string;
} & (
  | { allowDeselect?: false; onChange: (value: T) => void }
  | { allowDeselect: true; onChange: (value: T | null) => void }
);

/** Escolha única entre poucas opções, em pílulas que quebram linha. */
export function ChipGroup<T extends string>({
  label,
  options,
  value,
  onChange,
  allowDeselect,
  error,
}: ChipGroupProps<T>) {
  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <View style={styles.row} accessibilityRole="radiogroup" accessibilityLabel={label}>
        {options.map((option) => {
          const selected = option.value === value;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="radio"
              accessibilityState={{ selected, checked: selected }}
              accessibilityLabel={option.label}
              onPress={() => {
                if (allowDeselect && selected) onChange(null);
                else onChange(option.value);
              }}
              style={({ pressed }) => [
                styles.chip,
                selected && styles.selected,
                pressed && !selected && styles.pressed,
              ]}
            >
              <Text variant="body" color={selected ? 'textOnPrimary' : 'text'}>
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs },
  chip: {
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.md,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.background,
    justifyContent: 'center',
  },
  selected: { backgroundColor: colors.primary, borderColor: colors.primary },
  pressed: { backgroundColor: colors.backgroundPressed },
});
