import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, View } from 'react-native';

import { colors, radii, sizes, spacing } from '../tokens';
import { Text } from './text';

export type SegmentedOption<T extends string> = {
  value: T;
  label: string;
  icon?: ComponentProps<typeof Ionicons>['name'];
};

export type SegmentedControlProps<T extends string> = {
  options: readonly SegmentedOption<T>[];
  value: T;
  onChange: (value: T) => void;
  accessibilityLabel: string;
};

/** Escolha única entre abas de mesma largura, com ícone opcional. */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
}: SegmentedControlProps<T>) {
  return (
    <View style={styles.track} accessibilityRole="tablist" accessibilityLabel={accessibilityLabel}>
      {options.map((option) => {
        const selected = option.value === value;
        return (
          <Pressable
            key={option.value}
            accessibilityRole="tab"
            accessibilityLabel={option.label}
            accessibilityState={{ selected }}
            onPress={() => onChange(option.value)}
            style={[styles.segment, selected && styles.selected]}
          >
            {option.icon ? (
              <Ionicons
                name={option.icon}
                size={18}
                color={colors.text}
                accessible={false}
                importantForAccessibility="no"
              />
            ) : null}
            <Text variant="label" color={selected ? 'text' : 'textSecondary'}>
              {option.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    flexDirection: 'row',
    borderRadius: radii.pill,
    backgroundColor: colors.surface,
    padding: spacing.xxs,
  },
  segment: {
    flex: 1,
    minHeight: sizes.touchTarget,
    borderRadius: radii.pill,
    borderWidth: 1,
    borderColor: 'transparent',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: spacing.xs,
    gap: spacing.xs,
  },
  selected: { backgroundColor: colors.background, borderColor: colors.border },
});
