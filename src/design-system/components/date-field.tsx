import { DateTimePicker, type DateTimePickerChangeEvent } from '@expo/ui/community/datetime-picker';
import Ionicons from '@expo/vector-icons/Ionicons';
import { useState } from 'react';
import { Modal, Platform, Pressable, ScrollView, StyleSheet, View } from 'react-native';
import { useReducedMotion } from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { borderWidths, colors, radii, sizes, spacing } from '../tokens';
import { Button } from './button';
import { Text } from './text';
import { TextButton } from './text-button';
import { TextField } from './text-field';

export type DateFieldProps = {
  label: string;
  placeholder: string;
  /** Data de calendário local, no formato YYYY-MM-DD. */
  value: string | null;
  onChange: (value: string | null) => void;
  minimumDate?: string;
  maximumDate?: string;
  error?: string;
};

function parseLocalDate(value: string | null | undefined): Date | undefined {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  const date = new Date(0);
  // Meio-dia evita mudanças de dia em transições de horário de verão à meia-noite.
  date.setHours(12, 0, 0, 0);
  date.setFullYear(year, month - 1, day);
  return date.getFullYear() === year && date.getMonth() === month - 1 && date.getDate() === day
    ? date
    : undefined;
}

function serializeLocalDate(date: Date) {
  const year = String(date.getFullYear()).padStart(4, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function displayDate(date: Date) {
  const [year, month, day] = serializeLocalDate(date).split('-');
  return `${day}/${month}/${year}`;
}

function clampDate(date: Date, minimum: Date | undefined, maximum: Date | undefined) {
  if (minimum && date < minimum) return minimum;
  if (maximum && date > maximum) return maximum;
  return date;
}

function WebDateField({
  label,
  placeholder,
  value,
  onChange,
  minimumDate,
  maximumDate,
  error,
}: DateFieldProps) {
  const selected = parseLocalDate(value);
  const formatted = selected ? displayDate(selected) : '';
  const [input, setInput] = useState({ value, text: formatted });
  // Sincroniza pré-preenchimentos sem apagar a digitação parcial em outros renders.
  if (input.value !== value) {
    setInput({ value, text: formatted });
  }
  const text = input.value === value ? input.text : formatted;
  const [day, month, year] = text.split('/');
  const date = text.length === 10 ? parseLocalDate(`${year}-${month}-${day}`) : undefined;
  const minimum = parseLocalDate(minimumDate);
  const maximum = parseLocalDate(maximumDate);
  let validationError: string | undefined;
  if (text.length === 10) {
    if (!date) validationError = 'Data inválida. Confira dia, mês e ano.';
    else if (minimum && date < minimum)
      validationError = `Use uma data a partir de ${displayDate(minimum)}.`;
    else if (maximum && date > maximum)
      validationError = `Use uma data até ${displayDate(maximum)}.`;
  }
  const message = error ?? validationError;

  return (
    <TextField
      label={label}
      placeholder={placeholder}
      value={text}
      icon="calendar-outline"
      keyboardType="number-pad"
      inputMode="numeric"
      autoComplete="off"
      textContentType="none"
      returnKeyType="done"
      accessibilityHint={message ?? 'Digite a data no formato DD/MM/AAAA.'}
      error={message}
      onChangeText={(next) => {
        const digits = next.replace(/\D/g, '').slice(0, 8);
        const masked = digits
          .replace(/^(\d{2})(\d)/, '$1/$2')
          .replace(/^(\d{2}\/\d{2})(\d)/, '$1/$2');
        const nextDate =
          digits.length === 8
            ? parseLocalDate(`${digits.slice(4)}-${digits.slice(2, 4)}-${digits.slice(0, 2)}`)
            : undefined;
        const nextValue =
          nextDate && (!minimum || nextDate >= minimum) && (!maximum || nextDate <= maximum)
            ? serializeLocalDate(nextDate)
            : null;
        setInput({ value: nextValue, text: masked });
        onChange(nextValue);
      }}
    />
  );
}

/** Campo de data controlado. O calendário local é preservado em todas as conversões. */
export function DateField({
  label,
  placeholder,
  value,
  onChange,
  minimumDate,
  maximumDate,
  error,
}: DateFieldProps) {
  const [draft, setDraft] = useState<Date | null>(null);
  const insets = useSafeAreaInsets();
  const reducedMotion = useReducedMotion();
  const selected = parseLocalDate(value);
  const minimum = parseLocalDate(minimumDate);
  const maximum = parseLocalDate(maximumDate);
  const open = draft !== null;

  function close() {
    setDraft(null);
  }

  function showPicker() {
    setDraft(clampDate(selected ?? maximum ?? new Date(), minimum, maximum));
  }

  function commit(date: Date) {
    const next = serializeLocalDate(clampDate(date, minimum, maximum));
    close();
    onChange(next);
  }

  function handleValueChange(_event: DateTimePickerChangeEvent, date: Date) {
    if (Platform.OS === 'android') {
      // O diálogo só emite onValueChange depois de confirmar.
      commit(date);
    } else {
      setDraft(clampDate(date, minimum, maximum));
    }
  }

  const picker = draft ? (
    <DateTimePicker
      value={clampDate(draft, minimum, maximum)}
      mode="date"
      minimumDate={minimum}
      maximumDate={maximum}
      onValueChange={handleValueChange}
      onDismiss={close}
      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
      presentation="dialog"
      locale="pt_BR"
      themeVariant="light"
      accentColor={colors.primary}
      positiveButton={{ label: 'Confirmar' }}
      negativeButton={{ label: 'Cancelar' }}
      style={styles.picker}
    />
  ) : null;

  if (Platform.OS === 'web') {
    return (
      <WebDateField
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        error={error}
      />
    );
  }

  return (
    <View style={styles.container}>
      <Text variant="label">{label}</Text>
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={`${label}: ${selected ? displayDate(selected) : 'não escolhida'}`}
        accessibilityHint={error ?? 'Abre o seletor de data.'}
        accessibilityState={{ expanded: open }}
        onPress={showPicker}
        style={({ pressed }) => [
          styles.field,
          pressed && styles.pressed,
          open && styles.fieldFocused,
          !!error && styles.fieldError,
        ]}
      >
        <Text color={selected ? 'text' : 'textPlaceholder'} numberOfLines={1} style={styles.value}>
          {selected ? displayDate(selected) : placeholder}
        </Text>
        <Ionicons
          name="calendar-outline"
          size={sizes.fieldIcon}
          color={colors.text}
          accessible={false}
          importantForAccessibility="no"
        />
      </Pressable>
      {error ? (
        <Text variant="bodySmall" color="danger" accessibilityLiveRegion="polite">
          {error}
        </Text>
      ) : null}

      {Platform.OS === 'android' ? (
        picker
      ) : (
        <Modal
          visible={open}
          transparent
          animationType={reducedMotion ? 'none' : 'slide'}
          onRequestClose={close}
        >
          <View style={[styles.modal, { paddingTop: insets.top }]}>
            <Pressable
              accessibilityRole="button"
              accessibilityLabel="Cancelar seleção de data"
              onPress={close}
              style={styles.backdrop}
            />
            <View
              accessibilityViewIsModal
              onAccessibilityEscape={close}
              style={[styles.sheet, { paddingBottom: insets.bottom + spacing.md }]}
            >
              <View style={styles.sheetHeader}>
                <Text variant="label" accessibilityRole="header" style={styles.title}>
                  {label}
                </Text>
                <TextButton label="Cancelar" onPress={close} />
              </View>
              <ScrollView style={styles.pickerScroll} contentContainerStyle={styles.pickerContent}>
                {picker}
              </ScrollView>
              <Button
                label="Confirmar"
                onPress={() => {
                  if (draft) commit(draft);
                }}
              />
            </View>
          </View>
        </Modal>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xs },
  field: {
    minHeight: sizes.field,
    paddingHorizontal: spacing.md,
    borderWidth: borderWidths.default,
    borderColor: colors.border,
    borderRadius: radii.field,
    backgroundColor: colors.background,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.xs,
  },
  fieldFocused: { borderColor: colors.borderFocused },
  fieldError: { borderColor: colors.danger },
  value: { flex: 1 },
  pressed: { backgroundColor: colors.backgroundPressed },
  modal: { flex: 1, justifyContent: 'flex-end' },
  backdrop: { ...StyleSheet.absoluteFill, backgroundColor: colors.overlay },
  sheet: {
    flexShrink: 1,
    backgroundColor: colors.background,
    borderTopLeftRadius: radii.sheet,
    borderTopRightRadius: radii.sheet,
    paddingHorizontal: spacing.screen,
    paddingTop: spacing.md,
    gap: spacing.md,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: spacing.xs,
  },
  title: { flexShrink: 1 },
  pickerScroll: { flexGrow: 0, flexShrink: 1 },
  pickerContent: { paddingVertical: spacing.xs },
  picker: { width: '100%' },
});
