import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, radii, sizes, spacing } from '../tokens';
import { Text } from './text';

export type SelectOption<T extends string | number> = { value: T; label: string };

export type SelectFieldProps<T extends string | number> = {
  label: string;
  placeholder: string;
  options: readonly SelectOption<T>[];
  value: T | null;
  error?: string;
} & (
  | { clearLabel?: undefined; onChange: (value: T) => void }
  | { clearLabel: string; onChange: (value: T | null) => void }
);

/** Campo com aparência de TextField que abre uma lista de opções numa folha inferior. */
export function SelectField<T extends string | number>({
  label,
  placeholder,
  options,
  value,
  onChange,
  clearLabel,
  error,
}: SelectFieldProps<T>) {
  const [open, setOpen] = useState(false);
  const insets = useSafeAreaInsets();
  const selected = options.find((option) => option.value === value);

  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected?.label ?? 'não escolhido'}`}
        accessibilityHint={error}
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          pressed && styles.pressed,
          !!error && styles.fieldError,
        ]}
      >
        <Text color={selected ? 'text' : 'textPlaceholder'} numberOfLines={1} style={styles.value}>
          {selected?.label ?? placeholder}
        </Text>
        <Ionicons name="chevron-down" size={20} color={colors.text} />
      </Pressable>
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      <Modal visible={open} transparent animationType="slide" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={styles.backdrop}
          accessibilityLabel="Fechar"
          onPress={() => setOpen(false)}
        />
        <View style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}>
          <Text variant="label" style={styles.sheetTitle}>
            {label}
          </Text>
          <FlatList
            data={options}
            keyExtractor={(option) => String(option.value)}
            initialNumToRender={20}
            ListHeaderComponent={
              clearLabel !== undefined ? (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={clearLabel}
                  accessibilityState={{ selected: value === null }}
                  onPress={() => {
                    onChange(null);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text variant={value === null ? 'label' : 'body'}>{clearLabel}</Text>
                  {value === null ? (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              ) : undefined
            }
            renderItem={({ item }) => {
              const isSelected = item.value === value;
              return (
                <Pressable
                  accessibilityRole="button"
                  accessibilityLabel={item.label}
                  accessibilityState={{ selected: isSelected }}
                  onPress={() => {
                    onChange(item.value);
                    setOpen(false);
                  }}
                  style={({ pressed }) => [styles.option, pressed && styles.pressed]}
                >
                  <Text variant={isSelected ? 'label' : 'body'}>{item.label}</Text>
                  {isSelected ? (
                    <Ionicons name="checkmark" size={20} color={colors.primary} />
                  ) : null}
                </Pressable>
              );
            }}
          />
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  field: {
    minHeight: sizes.field,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fieldError: { borderColor: colors.danger },
  value: { flex: 1 },
  pressed: { backgroundColor: colors.backgroundPressed },
  backdrop: { flex: 1, backgroundColor: colors.overlay },
  sheet: {
    maxHeight: '60%',
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingTop: spacing.md,
  },
  sheetTitle: { paddingHorizontal: spacing.screen, paddingBottom: spacing.xs },
  option: {
    minHeight: sizes.touchTarget,
    paddingHorizontal: spacing.screen,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
});
