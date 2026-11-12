import Ionicons from '@expo/vector-icons/Ionicons';
import type { ComponentProps } from 'react';
import { Pressable, StyleSheet, type PressableProps } from 'react-native';

import { colors, radii, sizes } from '../tokens';

export type IconButtonProps = Omit<PressableProps, 'children' | 'style'> & {
  icon: ComponentProps<typeof Ionicons>['name'];
  /** Obrigatório: o ícone sozinho não diz nada ao leitor de tela. */
  accessibilityLabel: string;
};

export function IconButton({ icon, ...rest }: IconButtonProps) {
  return (
    <Pressable
      accessibilityRole="button"
      {...rest}
      style={({ pressed }) => [styles.base, pressed && styles.pressed]}
    >
      <Ionicons name={icon} size={24} color={colors.text} />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    borderRadius: radii.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.backgroundPressed },
});
