# 0005. Playfair Display + Inter, só tema claro

- Status: Aceito
- Data: 2026-11-09

## Contexto

Os mockups usam uma serifada nos títulos e uma sem serifa no texto. Um dos títulos estava em uma serifada diferente das demais.

## Decisão

- **Playfair Display** em títulos e na marca; **Inter** em todo o resto. A serifada divergente do mockup foi unificada em Playfair.
- Só os pesos usados são embutidos: Playfair Regular, Italic e SemiBold; Inter Regular, SemiBold e Bold. Cada um é importado pelo subcaminho do pacote `@expo-google-fonts/*` para os outros não entrarem no bundle.
- As fontes carregam com `useFonts` em `src/app/_layout.tsx`, com a splash segurando a primeira tela até estarem prontas.
- Nunca usar `fontWeight` ou `fontStyle` com essas famílias: o Android sintetiza negrito e itálico falsos. Escolhe-se a variante de `Text`.
- **Só tema claro no MVP** (`userInterfaceStyle: 'light'`).

## Consequências

- Peso novo significa mais um arquivo no app. Adicione só com uso real.
- Quando houver development build, vale migrar para o config plugin do `expo-font`, que embute as fontes no binário e elimina o carregamento em runtime.
- Tema escuro, quando vier, entra como um segundo conjunto de papéis em `colors`. Por isso as telas já usam papéis e não valores.
