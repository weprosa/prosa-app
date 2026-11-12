// https://docs.expo.dev/guides/using-eslint/
const { defineConfig } = require('eslint/config');
const expoConfig = require('eslint-config-expo/flat');
const prettierConfig = require('eslint-config-prettier/flat');

module.exports = defineConfig([
  expoConfig,
  prettierConfig,
  {
    ignores: ['dist/*', '.expo/*'],
  },
  {
    // Fronteiras do design system (docs/adr/0004): telas não usam texto, botão ou
    // campo crus do React Native, nem cores fora dos tokens.
    files: ['src/app/**', 'src/features/**'],
    rules: {
      'no-restricted-imports': [
        'error',
        {
          paths: [
            {
              name: 'react-native',
              importNames: ['Text', 'TextInput', 'Button', 'TouchableOpacity'],
              message: 'Use os componentes de @/design-system.',
            },
          ],
          patterns: [
            {
              group: ['@/design-system/*'],
              message: 'Importe de @/design-system (o índice), não de arquivos internos.',
            },
          ],
        },
      ],
    },
  },
]);
