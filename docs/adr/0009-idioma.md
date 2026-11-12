# 0009. Código em inglês, interface em português

- Status: Aceito
- Data: 2026-11-09

## Contexto

O produto e a equipe são brasileiros; o ecossistema e as ferramentas são em inglês.

## Decisão

- Código, nomes de arquivo, rotas e identificadores em inglês.
- Texto de interface, documentação, ADRs e comentários em português do Brasil.
- Os textos de interface ficam, por enquanto, direto nas telas. Não há biblioteca de internacionalização.

## Consequências

- Um segundo idioma vai exigir extrair os textos e adotar uma biblioteca de i18n, com ADR.
