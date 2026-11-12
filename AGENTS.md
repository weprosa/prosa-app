# Prosa (app)

App iOS e Android do Prosa, em Expo + React Native. Este arquivo é o contrato de trabalho para pessoas e agentes de IA neste repositório. `CLAUDE.md` apenas importa este arquivo: edite sempre aqui.

Leia antes de mudar qualquer coisa:

- [PRODUCT.md](PRODUCT.md): o que o produto é e as regras que não se negociam.
- [DESIGN.md](DESIGN.md): o design system (cores, tipografia, componentes).
- [docs/adr/](docs/adr/README.md): decisões de arquitetura e seus limites.

## Limites (não ultrapasse sem um ADR novo)

1. **Só este repositório.** Back-end (Laravel) e IA têm repositórios e responsáveis próprios. Não crie código de servidor nem de IA aqui, e não invente contrato de API: o que não estiver confirmado em [ADR 0008](docs/adr/0008-integracao-com-o-back-end.md) é proposta e deve ser marcado como tal.
2. **O app nunca fala com um modelo de IA diretamente.** Toda análise de perfil e todo match passam pelo back-end. Nenhuma chave de IA, nenhum segredo, entra no app: `EXPO_PUBLIC_*` é público.
3. **Foto só depois do match.** Nenhuma tela mostra foto de outra pessoa antes de o back-end confirmar o match. É a regra central do produto.
4. **UI só com o design system.** Em `src/app` e `src/features`, texto, botão, campo e cor vêm de `@/design-system`. Sem hex, sem tamanho de fonte e sem número de espaçamento solto em tela. Faltou um componente ou token? Crie no design system e documente em `DESIGN.md`. O ESLint barra parte disso.
5. **Sem dependência nova sem motivo.** Prefira módulos Expo. Biblioteca de UI, de estilo, de estado global ou de formulário exige ADR.
6. **Permissões:** só localização em uso e câmera/fotos, pedidas no momento do uso, via `src/lib/permissions.ts`. Localização em segundo plano, microfone, contatos e rastreamento (ATT) estão fora do MVP ([ADR 0006](docs/adr/0006-permissoes.md)).
7. **Sem commit, push ou PR sem pedido explícito.** A organização no GitHub ainda não existe.
8. **Nunca edite `ios/` e `android/`.** São gerados (CNG). Configuração nativa vai em `app.config.ts`.

## Estrutura

```
src/
  app/             Rotas do Expo Router. Só roteamento: cada arquivo reexporta uma tela.
  features/<x>/    Telas, componentes e lógica de uma área (auth, onboarding, ...).
  design-system/   Tokens e componentes de UI. Não conhece features nem API.
  lib/             Infra sem UI: API, sessão, permissões, env.
docs/adr/          Decisões de arquitetura.
```

Dependências apontam para baixo: `app → features → design-system | lib`. Uma feature não importa de outra; o que for comum desce para `design-system` ou `lib`.

## Convenções

- **Idioma:** código, nomes de arquivo e rotas em inglês. Texto de interface, documentação e comentários em português do Brasil.
- **Arquivos** em `kebab-case`; componentes em `PascalCase`; exports nomeados (default só nos arquivos de rota).
- **TypeScript** estrito, sem `any`. Imports com o alias `@/`.
- **Estilo:** `StyleSheet.create` com tokens. Sem estilo inline com valor literal.
- **Fontes:** nunca use `fontWeight`/`fontStyle`; escolha a variante de `Text`.
- **Estado de servidor:** TanStack Query. **Estado local:** `useState`. Nada de store global por enquanto.
- **React Compiler está ligado:** não escreva `useMemo`/`useCallback`/`memo` por reflexo.
- **Texto de interface:** direto e caloroso, "você", sem jargão. Erro diz o problema e o que fazer.
- **Acessibilidade:** alvo de toque de 48pt no mínimo, `accessibilityLabel` em todo controle sem texto, contraste de 4.5:1 em texto.

## Performance

Regras completas em [ADR 0007](docs/adr/0007-performance.md). O essencial: listas com `FlatList` ou mais rápido (nunca `map` dentro de `ScrollView` para dados da API), imagens com `expo-image` e tamanho pedido ao servidor, animações em `react-native-reanimated` (thread de UI) animando só `transform` e `opacity`.

## Comandos

```bash
npx expo install <pacote>   # SEMPRE no lugar de npm install: resolve a versão do SDK
npm start                   # servidor de desenvolvimento
npm run check               # typecheck + lint + formatação. Rode antes de dar algo por pronto.
npm run format              # aplica o Prettier
npm run doctor              # diagnostica dependências e config
```

## Expo muda a cada SDK: não confie na memória

Antes de escrever código que toque API do Expo, do EAS ou do React Native:

1. Veja a versão maior de `expo` em `package.json` (hoje, SDK 58).
2. Leia a doc versionada: `https://docs.expo.dev/versions/v<major>.0.0/`.
3. Para o resto, comece por https://docs.expo.dev/llms.txt e siga os links. Na dúvida, os tipos em `node_modules` são a fonte da verdade.

Bibliotecas com código nativo fora do Expo Go exigem development build (`eas build --profile development`). Use `npx eas-cli@latest <comando>` para o EAS.

## Ao terminar uma tarefa

- `npm run check` passa.
- A tela foi vista rodando (iOS e Android quando houver dispositivo; diga o que não foi verificado).
- Decisão que muda um limite acima virou ADR. Componente ou token novo está em `DESIGN.md`.
