import type { ReactNode } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { colors, sizes, spacing } from '../tokens';

export type ScreenProps = {
  children: ReactNode;
  /** Use em telas com formulário: rola e desvia do teclado. */
  scroll?: boolean;
};

/** Moldura de toda tela: fundo, safe area, margem lateral e largura máxima. */
export function Screen({ children, scroll = false }: ScreenProps) {
  const insets = useSafeAreaInsets();
  const padding = {
    paddingTop: insets.top + spacing.md,
    paddingBottom: insets.bottom + spacing.lg,
  };

  if (!scroll) {
    return (
      <View style={[styles.root, padding]}>
        <View style={styles.content}>{children}</View>
      </View>
    );
  }

  return (
    <KeyboardAvoidingView style={styles.root} behavior="padding">
      <ScrollView
        contentContainerStyle={[styles.scrollContent, padding]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>{children}</View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.background },
  scrollContent: { flexGrow: 1 },
  content: {
    flex: 1,
    width: '100%',
    maxWidth: sizes.contentMaxWidth,
    alignSelf: 'center',
    paddingHorizontal: spacing.screen,
  },
});
