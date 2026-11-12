import { Pressable, StyleSheet, View, type PressableProps } from 'react-native';

import { colors, spacing, type TextVariant } from '../tokens';
import { Text } from './text';

export type TextLinkProps = Omit<PressableProps, 'children' | 'style'> & {
  label: string;
  variant?: Extract<TextVariant, 'link' | 'label'>;
  underline?: boolean;
};

export function TextLink({ label, variant = 'link', underline = true, ...rest }: TextLinkProps) {
  return (
    <Pressable
      accessibilityRole="link"
      hitSlop={spacing.sm}
      {...rest}
      style={({ pressed }) => pressed && styles.pressed}
    >
      <View style={underline && styles.underline}>
        <Text variant={variant} color="link">
          {label}
        </Text>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  pressed: { opacity: 0.6 },
  // Borda em vez de `textDecorationLine`: dá o respiro entre texto e traço do mockup.
  underline: { borderBottomWidth: 1.5, borderBottomColor: colors.link },
});
