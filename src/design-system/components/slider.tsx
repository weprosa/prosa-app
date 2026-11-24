import { useEffect, useState } from 'react';
import { Platform, StyleSheet, View, type LayoutChangeEvent, type ViewProps } from 'react-native';
import { GestureDetector, usePanGesture } from 'react-native-gesture-handler';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  type SharedValue,
} from 'react-native-reanimated';
import { scheduleOnRN, scheduleOnUI } from 'react-native-worklets';

import { borderWidths, colors, radii, sizes, spacing } from '../tokens';
import { Text } from './text';

type SliderBaseProps = {
  label: string;
  valueText: string;
  min: number;
  max: number;
  step?: number;
  minLabel: string;
  maxLabel: string;
};

export type SliderProps = SliderBaseProps & {
  value: number;
  onChange: (value: number) => void;
  accessibilityValueText?: string;
};

export type RangeSliderProps = SliderBaseProps & {
  minDistance?: number;
  value: readonly [number, number];
  onChange: (value: [number, number]) => void;
};

type Values = [number, number];
type ThumbIndex = 0 | 1;
type SliderControlProps = SliderBaseProps & {
  range: boolean;
  minDistance?: number;
  value: readonly [number, number];
  onChange: (value: Values) => void;
  accessibilityValueText?: string;
};

/** Valores pertencem à grade iniciada em min; max também é um extremo selecionável. */
function snapValue(value: number, min: number, max: number, step: number) {
  'worklet';
  const bounded = Math.min(max, Math.max(min, value));
  const snapped = Math.min(max, min + Math.round((bounded - min) / step) * step);
  return max - bounded < Math.abs(snapped - bounded) ? max : snapped;
}

function floorValue(value: number, min: number, max: number, step: number) {
  'worklet';
  if (value >= max) return max;
  return Math.max(min, min + Math.floor((value - min) / step) * step);
}

function ceilValue(value: number, min: number, max: number, step: number) {
  'worklet';
  return Math.min(max, Math.max(min, min + Math.ceil((value - min) / step) * step));
}

function thumbBounds(
  index: ThumbIndex,
  values: readonly [number, number],
  min: number,
  max: number,
  step: number,
  distance: number,
): Values {
  'worklet';
  return index === 0
    ? [min, floorValue(values[1] - distance, min, max, step)]
    : [ceilValue(values[0] + distance, min, max, step), max];
}

function normalizeValues(
  value: readonly [number, number],
  min: number,
  max: number,
  step: number,
  distance: number,
): Values {
  const upper = Math.max(
    snapValue(value[1], min, max, step),
    ceilValue(min + distance, min, max, step),
  );
  const lower = Math.min(
    snapValue(value[0], min, max, step),
    floorValue(upper - distance, min, max, step),
  );
  return [lower, upper];
}

/** Slider controlado, com valor de apresentação separado do valor numérico. */
export function Slider({ value, onChange, ...props }: SliderProps) {
  return (
    <SliderControl
      {...props}
      range={false}
      value={[props.min, value]}
      onChange={(next) => onChange(next[1])}
    />
  );
}

/** Faixa controlada: cada extremo respeita a grade e a distância mínima. */
export function RangeSlider(props: RangeSliderProps) {
  return <SliderControl {...props} range />;
}

function SliderControl({
  label,
  valueText,
  min,
  max,
  step = 1,
  minDistance = 0,
  value,
  onChange,
  minLabel,
  maxLabel,
  range,
  accessibilityValueText,
}: SliderControlProps) {
  if (
    !Number.isInteger(min) ||
    !Number.isInteger(max) ||
    max < min ||
    !Number.isInteger(step) ||
    step <= 0 ||
    !Number.isInteger(minDistance) ||
    minDistance < 0 ||
    minDistance > max - min ||
    !value.every(Number.isFinite)
  ) {
    throw new RangeError(
      'Slider: use limites e passos inteiros, com min ≤ max e distância válida.',
    );
  }

  const distance = range ? minDistance : 0;
  const [gestureRevision, setGestureRevision] = useState(0);
  const [lower, upper] = normalizeValues(value, min, max, step, distance);
  const current = useSharedValue<Values>([lower, upper]);
  const width = useSharedValue(0);
  const activeThumb = useSharedValue(-1);
  const dragOrigin = useSharedValue(0);
  const span = max - min;

  useEffect(() => {
    // Uma resposta do estado controlado não deve atrasar o arraste na thread de UI.
    scheduleOnUI(() => {
      'worklet';
      if (activeThumb.get() === -1) current.set([lower, upper]);
    });
  }, [lower, upper, activeThumb, current, gestureRevision]);

  function finishGesture() {
    // Reconcilia também quando o consumidor rejeita ou altera o último valor emitido.
    setGestureRevision((revision) => revision + 1);
  }

  function changeThumb(index: ThumbIndex, requested: number) {
    'worklet';
    const bounds = thumbBounds(index, current.get(), min, max, step, distance);
    const next = Math.min(bounds[1], Math.max(bounds[0], snapValue(requested, min, max, step)));
    if (next === current.get()[index]) return;
    const nextValues: Values = index === 0 ? [next, current.get()[1]] : [current.get()[0], next];
    current.set(nextValues);
    scheduleOnRN(onChange, nextValues);
  }

  const pan = usePanGesture({
    enabled: span > 0,
    maxPointers: 1,
    activeOffsetX: [-spacing.xxs, spacing.xxs],
    failOffsetY: [-spacing.xs, spacing.xs],
    onActivate: (event) => {
      'worklet';
      if (width.get() <= 0) return;
      const startX = event.x - event.translationX - sizes.touchTarget / 2;
      const lowerX = ((current.get()[0] - min) / span) * width.get();
      const upperX = ((current.get()[1] - min) / span) * width.get();
      const lowerDistance = Math.abs(startX - lowerX);
      const upperDistance = Math.abs(startX - upperX);
      // Se os polegares coincidirem, o sentido do arraste permite separar ambos.
      const index =
        range &&
        (lowerDistance < upperDistance ||
          (lowerDistance === upperDistance && event.translationX < 0))
          ? 0
          : 1;
      activeThumb.set(index);
      dragOrigin.set(current.get()[index]);
      changeThumb(index, dragOrigin.get() + (event.translationX / width.get()) * span);
    },
    onUpdate: (event) => {
      'worklet';
      if (width.get() <= 0 || activeThumb.get() === -1) return;
      changeThumb(
        activeThumb.get() as ThumbIndex,
        dragOrigin.get() + (event.translationX / width.get()) * span,
      );
    },
    onFinalize: () => {
      'worklet';
      if (activeThumb.get() === -1) return;
      activeThumb.set(-1);
      scheduleOnRN(finishGesture);
    },
  });

  const activeStyle = useAnimatedStyle(() => {
    const start = range && span > 0 ? ((current.get()[0] - min) / span) * width.get() : 0;
    const end = span > 0 ? ((current.get()[1] - min) / span) * width.get() : 0;
    return {
      transform: [
        { translateX: (start + end - width.get()) / 2 },
        { scaleX: width.get() > 0 ? (end - start) / width.get() : 0 },
      ],
    };
  });

  function handleLayout(event: LayoutChangeEvent) {
    width.set(Math.max(0, event.nativeEvent.layout.width - sizes.touchTarget));
  }

  function adjust(index: ThumbIndex, direction: number) {
    scheduleOnUI(() => {
      'worklet';
      // O extremo max pode ter um último passo menor que step.
      const tick = (current.get()[index] - min) / step;
      const requested = min + (direction < 0 ? Math.ceil(tick) - 1 : Math.floor(tick) + 1) * step;
      changeThumb(index, requested);
    });
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text variant="label" style={styles.label}>
          {label}
        </Text>
        <Text variant="label" color="link" style={styles.value}>
          {valueText}
        </Text>
      </View>
      <GestureDetector gesture={pan} touchAction="pan-y">
        <View collapsable={false} onLayout={handleLayout} style={styles.control}>
          <View pointerEvents="none" accessible={false} style={styles.track} />
          <Animated.View
            pointerEvents="none"
            accessible={false}
            style={[styles.track, styles.activeTrack, activeStyle]}
          />
          {range ? (
            <SliderThumb
              index={0}
              current={current}
              width={width}
              min={min}
              max={max}
              bounds={thumbBounds(0, [lower, upper], min, max, step, distance)}
              value={lower}
              label={`${label}, mínimo`}
              valueText={`${lower === min ? minLabel : lower}. ${valueText}`}
              onAdjust={adjust}
            />
          ) : null}
          <SliderThumb
            index={1}
            current={current}
            width={width}
            min={min}
            max={max}
            bounds={range ? thumbBounds(1, [lower, upper], min, max, step, distance) : [min, max]}
            value={upper}
            label={range ? `${label}, máximo` : label}
            valueText={
              range
                ? `${upper === max ? maxLabel : upper}. ${valueText}`
                : (accessibilityValueText ?? valueText)
            }
            onAdjust={adjust}
          />
        </View>
      </GestureDetector>
      <View style={styles.limits}>
        <Text variant="bodySmall" color="textSecondary">
          {minLabel}
        </Text>
        <Text variant="bodySmall" color="textSecondary" align="right">
          {maxLabel}
        </Text>
      </View>
    </View>
  );
}

type SliderThumbProps = {
  index: ThumbIndex;
  current: SharedValue<Values>;
  width: SharedValue<number>;
  min: number;
  max: number;
  bounds: Values;
  value: number;
  label: string;
  valueText: string;
  onAdjust: (index: ThumbIndex, direction: number) => void;
};

function SliderThumb({
  index,
  current,
  width,
  min,
  max,
  bounds,
  value,
  label,
  valueText,
  onAdjust,
}: SliderThumbProps) {
  const positionStyle = useAnimatedStyle(() => ({
    transform: [
      { translateX: max > min ? ((current.get()[index] - min) / (max - min)) * width.get() : 0 },
    ],
  }));
  const webKeyboardProps: Pick<
    ViewProps,
    | 'tabIndex'
    | 'onKeyDown'
    | 'aria-valuemin'
    | 'aria-valuemax'
    | 'aria-valuenow'
    | 'aria-valuetext'
  > =
    Platform.OS === 'web'
      ? {
          tabIndex: 0 as const,
          'aria-valuemin': bounds[0],
          'aria-valuemax': bounds[1],
          'aria-valuenow': value,
          'aria-valuetext': valueText,
          onKeyDown: (event) => {
            const { key } = event.nativeEvent;
            if (key === 'ArrowRight' || key === 'ArrowUp') {
              event.preventDefault();
              onAdjust(index, 1);
            } else if (key === 'ArrowLeft' || key === 'ArrowDown') {
              event.preventDefault();
              onAdjust(index, -1);
            }
          },
        }
      : {};

  return (
    <Animated.View
      {...webKeyboardProps}
      accessible
      focusable
      accessibilityRole="adjustable"
      accessibilityLabel={label}
      accessibilityValue={{ min: bounds[0], max: bounds[1], now: value, text: valueText }}
      accessibilityState={{ disabled: bounds[0] === bounds[1] }}
      accessibilityActions={[
        { name: 'increment', label: 'Aumentar' },
        { name: 'decrement', label: 'Diminuir' },
      ]}
      onAccessibilityAction={(event) => {
        if (event.nativeEvent.actionName === 'increment') onAdjust(index, 1);
        if (event.nativeEvent.actionName === 'decrement') onAdjust(index, -1);
      }}
      style={[styles.thumbTarget, positionStyle]}
    >
      <View accessible={false} style={styles.thumb} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: { gap: spacing.xxs },
  header: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    gap: spacing.xs,
  },
  label: { flexShrink: 1 },
  value: { marginLeft: 'auto', textAlign: 'right' },
  control: { height: sizes.touchTarget, minWidth: sizes.touchTarget },
  track: {
    position: 'absolute',
    left: sizes.touchTarget / 2,
    right: sizes.touchTarget / 2,
    top: (sizes.touchTarget - sizes.sliderTrack) / 2,
    height: sizes.sliderTrack,
    borderRadius: radii.pill,
    backgroundColor: colors.track,
  },
  activeTrack: { backgroundColor: colors.primary },
  thumbTarget: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: sizes.touchTarget,
    height: sizes.touchTarget,
    alignItems: 'center',
    justifyContent: 'center',
  },
  thumb: {
    width: sizes.sliderThumb,
    height: sizes.sliderThumb,
    borderRadius: radii.pill,
    borderWidth: borderWidths.emphasis,
    borderColor: colors.primary,
    backgroundColor: colors.background,
  },
  limits: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: spacing.xs,
    paddingHorizontal: sizes.touchTarget / 2,
  },
});
