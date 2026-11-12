# 0004. Design system próprio com tokens e StyleSheet

- Status: Aceito
- Data: 2026-11-09

## Contexto

O Prosa tem identidade visual própria e simples (ver `DESIGN.md`). Precisamos de fonte, cor, campo e botão padronizados, com o menor custo em runtime.

## Decisão

- Design system próprio em `src/design-system`: tokens (`colors`, `typography`, `spacing`, `radii`, `sizes`) e componentes (`Screen`, `Text`, `Button`, `IconButton`, `TextField`, `TextLink`, `Divider`, `Wordmark`).
- Estilo com `StyleSheet.create` do React Native. Sem NativeWind, Tamagui, styled-components ou biblioteca de componentes.
- Telas usam papéis (`colors.primary`), nunca valores. A paleta bruta não sai de `tokens/colors.ts`.
- Telas importam do índice `@/design-system`, não de arquivos internos.
- O ESLint barra, em `src/app` e `src/features`, o uso de `Text`, `TextInput`, `Button` e `TouchableOpacity` do React Native.
- Ícones: Ionicons via `@expo/vector-icons`, sempre dentro de um componente do design system.

## Consequências

- Zero custo de biblioteca de estilo em runtime e nenhuma etapa extra de build.
- Todo componente novo é escrito e mantido por nós, e documentado em `DESIGN.md`.
- Hex e número solto em tela ainda não são barrados por lint: é regra de revisão.
