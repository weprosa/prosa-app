# 0003. Estrutura de pastas e fronteiras

- Status: Aceito
- Data: 2026-11-09

## Contexto

O app vai crescer por áreas (entrada, onboarding, matches, conversa). Sem fronteiras, tudo acaba importando tudo.

## Decisão

```
src/app/            Rotas. Cada arquivo só reexporta uma tela de features/.
src/features/<x>/   Telas, componentes e lógica de uma área.
src/design-system/  Tokens e componentes de UI.
src/lib/            Infra sem UI: API, sessão, permissões, env.
```

- As dependências apontam para baixo: `app → features → design-system | lib`.
- Uma feature não importa de outra. O que for compartilhado desce para `design-system` (UI) ou `lib` (infra).
- `design-system` não conhece features, navegação nem API.
- `src/app` não tem lógica: manter rotas finas deixa as telas testáveis e as rotas fáceis de reorganizar.

## Consequências

- Às vezes um componente precisa ser promovido de uma feature para o design system antes de ser reusado.
- A regra entre features ainda não é verificada por lint; por enquanto depende de revisão.
