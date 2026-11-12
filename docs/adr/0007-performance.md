# 0007. Regras de performance

- Status: Aceito
- Data: 2026-11-09

## Contexto

Performance é prioridade do projeto, e o app vai rodar em Android de entrada tanto quanto em iPhone recente. É mais barato seguir regras desde o início do que otimizar depois.

## Decisão

**Renderização**

- React Compiler ligado: nada de `useMemo`/`useCallback`/`memo` por reflexo. Otimização manual só com medição.
- Estado mora o mais perto possível de quem usa. Nada de store global sem ADR.

**Listas**

- Dados da API sempre em lista virtualizada (`FlatList` ou mais rápida), com `keyExtractor` estável. Nunca `map` dentro de `ScrollView`.

**Imagens**

- Sempre `expo-image`, com dimensões definidas e cache. O servidor entrega a imagem no tamanho de exibição, não a original.

**Animação**

- `react-native-reanimated`, rodando na thread de UI. Animar só `transform` e `opacity`.
- Respeitar a preferência de reduzir movimento do sistema.

**Bundle e inicialização**

- Dependência nova precisa de motivo. Prefira módulos Expo e importe por subcaminho quando o pacote permitir.
- Só os pesos de fonte usados (ADR 0005).
- Nada de rede ou trabalho pesado antes da primeira tela aparecer.

**Rede**

- Estado de servidor com TanStack Query: cache, deduplicação e cancelamento. Paginação em toda lista.
- Toda chamada tem timeout (15 s em `src/lib/api/client.ts`).

**Medição**

- Performance se confere em build de release, em aparelho real, incluindo um Android de entrada. O modo de desenvolvimento não é referência.

## Consequências

- Algumas soluções rápidas ficam proibidas.
- Ainda não há orçamento numérico (tempo de abertura, tamanho do app). Definir quando houver o primeiro build de release para medir.
