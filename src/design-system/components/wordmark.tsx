import { Text } from './text';

/** Marca "Prosa" em texto, até existir um logotipo desenhado. */
export function Wordmark() {
  return (
    <Text variant="wordmark" color="primary" accessibilityRole="header">
      Prosa
    </Text>
  );
}
