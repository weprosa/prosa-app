# 0001. Registrar decisões em ADRs

- Status: Aceito
- Data: 2026-11-09

## Contexto

A equipe tem três pessoas em três frentes (app, back-end, IA) e usa agentes de IA para escrever código. Sem registro, cada sessão de trabalho redescobre ou contradiz decisões anteriores.

## Decisão

Toda decisão que restringe trabalho futuro (tecnologia, estrutura, contrato, limite de produto) vira um ADR em `docs/adr/`, em português. `AGENTS.md` resume os limites e aponta para os ADRs; agentes devem lê-los antes de mudar o que eles cobrem.

## Consequências

- Mudar uma decisão exige um ADR novo, o que dá um pouco de trabalho de propósito.
- Decisões que cruzam repositórios (contrato de API, por exemplo) ficam aqui como `Proposto` até existir um lugar comum para elas.
