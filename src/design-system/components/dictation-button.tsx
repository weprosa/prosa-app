import Ionicons from '@expo/vector-icons/Ionicons';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useReducedMotion,
  useSharedValue,
  withTiming,
  type SharedValue,
} from 'react-native-reanimated';

import { colors, radii, sizes } from '../tokens';

export type DictationButtonProps = {
  listening: boolean;
  busy?: boolean;
  /** Nível de áudio entre 0 e 1, atualizado na thread de UI. */
  level: SharedValue<number>;
  onPress: () => void;
  disabled?: boolean;
  accessibilityLabel: string;
  accessibilityHint?: string;
};

/** Controle de ditado com halo de áudio; não conhece a origem da gravação. */
export function DictationButton({
  listening,
  busy = false,
  level,
  onPress,
  disabled = false,
  accessibilityLabel,
  accessibilityHint,
}: DictationButtonProps) {
  const reducedMotion = useReducedMotion();
  const pressed = useSharedValue(false);
  const inactive = disabled || busy;
  const haloStyle = useAnimatedStyle(() => ({
    opacity: withTiming(listening ? 0.18 : 0, { duration: 150 }),
    transform: [
      {
        scale: reducedMotion
          ? 1
          : withTiming(listening ? 1 + Math.min(1, Math.max(0, level.value)) * 0.35 : 1, {
              duration: 100,
            }),
      },
    ],
  }));
  const pressStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: reducedMotion ? 1 : withTiming(pressed.value ? 0.96 : 1, { duration: 100 }) },
    ],
  }));

  return (
    <View style={styles.container}>
      <Animated.View
        pointerEvents="none"
        accessible={false}
        importantForAccessibility="no-hide-descendants"
        style={[styles.halo, haloStyle]}
      />
      <Animated.View style={pressStyle}>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={accessibilityLabel}
          accessibilityHint={accessibilityHint}
          accessibilityState={{ busy, disabled: inactive }}
          disabled={inactive}
          onPress={onPress}
          onPressIn={() => {
            pressed.value = true;
          }}
          onPressOut={() => {
            pressed.value = false;
          }}
          style={({ pressed: isPressed }) => [
            styles.button,
            isPressed && styles.pressed,
            disabled && styles.disabled,
          ]}
        >
          {busy ? (
            <ActivityIndicator color={colors.textOnPrimary} />
          ) : (
            <Ionicons
              name={listening ? 'stop' : 'mic'}
              size={sizes.dictationIcon}
              color={colors.textOnPrimary}
              accessible={false}
              importantForAccessibility="no"
            />
          )}
        </Pressable>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: sizes.dictationControl,
    height: sizes.dictationControl,
    alignItems: 'center',
    justifyContent: 'center',
  },
  halo: {
    position: 'absolute',
    width: sizes.dictationHalo,
    height: sizes.dictationHalo,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
  },
  button: {
    width: sizes.dictationButton,
    height: sizes.dictationButton,
    borderRadius: radii.pill,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pressed: { backgroundColor: colors.primaryPressed },
  disabled: { opacity: 0.45 },
});
