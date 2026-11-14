# Design System: Prosa

Fonte da verdade no código: `src/design-system/`. Este documento explica as escolhas; se os dois divergirem, o código vale e este arquivo deve ser corrigido.

## Overview

Uma página em branco com uma voz. Fundo branco, texto quase preto, um único coral para a marca e para a ação principal. Títulos serifados (Playfair Display) dão o tom editorial e pessoal; todo o resto é Inter, discreto e legível. Sem sombras, sem gradientes, sem cartões: a hierarquia vem de tamanho, peso e espaço.

Só tema claro no MVP.

## Colors

Use sempre o papel (`colors.primary`), nunca o hex.

| Papel               | Valor     | Uso                                               |
| ------------------- | --------- | ------------------------------------------------- |
| `background`        | `#FFFFFF` | Fundo de toda tela e dos campos                   |
| `backgroundPressed` | `#F5F5F5` | Botão secundário e ícone pressionados             |
| `text`              | `#1A1A1A` | Títulos, rótulos, texto digitado                  |
| `textSecondary`     | `#5C5C5C` | Texto de apoio                                    |
| `textPlaceholder`   | `#737373` | Placeholder (4.7:1; não clarear)                  |
| `textOnPrimary`     | `#FFFFFF` | Texto sobre coral                                 |
| `primary`           | `#D64A4E` | Marca, botão principal, destaque em título grande |
| `primaryPressed`    | `#C2363C` | Botão principal pressionado                       |
| `link`              | `#C2363C` | Texto coral pequeno sobre branco (5.4:1)          |
| `border`            | `#D6D6D6` | Contorno de campos e botões secundários           |
| `borderFocused`     | `#1A1A1A` | Campo em foco                                     |
| `divider`           | `#E6E6E6` | Linhas separadoras                                |
| `danger`            | `#B3261E` | Erro (texto e contorno do campo)                  |

**Regra do coral.** `primary` (#D64A4E) tem 4.2:1 sobre branco: serve para fundo de botão com texto grande em negrito e para títulos grandes, não para texto pequeno. Texto coral pequeno usa `link`.

**Uma ação coral por tela.** O botão principal é o único bloco coral. O resto das ações é secundário ou link.

## Typography

Playfair Display (serifada) e Inter (sem serifa), carregadas em `src/app/_layout.tsx`. Cada peso é um arquivo: escolha a variante, nunca `fontWeight` ou `fontStyle`.

| Variante          | Fonte             | Tamanho / linha | Uso                                  |
| ----------------- | ----------------- | --------------- | ------------------------------------ |
| `display`         | Playfair Regular  | 44 / 52         | Frase de abertura                    |
| `displayItalic`   | Playfair Italic   | 44 / 52         | Trecho de ênfase dentro do `display` |
| `title`           | Playfair Regular  | 34 / 42         | Título de tela                       |
| `wordmark`        | Playfair SemiBold | 30 / 36         | A marca "Prosa"                      |
| `body`            | Inter Regular     | 17 / 26         | Texto corrido e texto de campo       |
| `bodySmall`       | Inter Regular     | 15 / 22         | Apoio, erro, rodapé                  |
| `label`           | Inter SemiBold    | 15 / 20         | Rótulo de campo                      |
| `link`            | Inter SemiBold    | 15 / 22         | Link em linha                        |
| `button`          | Inter Bold        | 17 / 22         | Botão principal                      |
| `buttonSecondary` | Inter SemiBold    | 16 / 22         | Botão secundário                     |

**Serifa é voz, não interface.** Playfair só em título e marca. Nada que se toca ou se preenche usa serifa.

A escala de fonte do sistema é respeitada até 1.4x (`MAX_FONT_SCALE`). Componentes usam altura mínima, não fixa, para crescer junto.

## Layout

- Espaçamento em múltiplos de 4: `xxs` 4, `xs` 8, `sm` 12, `md` 16, `lg` 24, `xl` 32, `xxl` 48.
- Margem lateral de tela: 28 (`spacing.screen`), aplicada por `Screen`.
- Conteúdo com largura máxima de 480, centralizado em telas largas.
- Itens de um mesmo grupo ficam a 8–16; grupos diferentes, a 24–32.
- Uma coluna. A ação principal fica onde o polegar alcança; o link de alternância ("Já tem conta?") fica no pé.

## Elevation & Depth

Não há sombra nem elevação. Separação é feita por espaço, contorno de 1px ou linha divisória. Se algo parecer precisar de sombra, revise a hierarquia antes.

## Shapes

- Botões: pílula (`radii.pill`).
- Campos: cantos de 14 (`radii.field`).
- Contornos de 1px. O sublinhado de link tem 1.5px, feito com borda para ter respiro do texto.

## Components

Todos em `src/design-system/components/`, importados de `@/design-system`.

### Screen

Moldura de toda tela: fundo, safe area, margem lateral, largura máxima. `scroll` para telas com formulário (rola e desvia do teclado).

### Text

Único componente de texto. Props: `variant`, `color` (papel), `align`.

### Buttons

`Button`, altura mínima 56, largura total.

- `primary`: fundo coral, texto branco em negrito. Uma por tela.
- `secondary`: fundo branco, contorno, texto escuro. Para alternativas (login social).
- Estados: pressionado (tom mais escuro / cinza claro), `disabled` (opacidade 45%), `loading` (indicador no lugar do texto, bloqueia toque).

`IconButton`: ícone (Ionicons) em área de toque de 48. `accessibilityLabel` obrigatório.

### Inputs / Fields

`TextField`: rótulo sempre visível acima do campo (placeholder é exemplo, não rótulo), altura mínima 52.

- Estados: padrão (contorno cinza), foco (contorno escuro), erro (contorno e mensagem em `danger` logo abaixo).
- Mensagem de erro diz o problema e o que fazer: "Use pelo menos 8 caracteres."
- Validação acontece ao enviar. Preencha sempre `autoComplete`, `textContentType`, `keyboardType` e `returnKeyType`, e encadeie o foco para o campo seguinte.

### TextLink

Link em linha, coral escuro, sublinhado por padrão. `hitSlop` amplia a área de toque.

### Divider

Linha de 1px, com rótulo opcional no meio ("ou").

### Wordmark

A marca "Prosa" em texto. Substituir por logotipo quando existir.

### ChipGroup

Escolha única entre poucas opções, em pílulas que quebram linha (altura de toque 48). Selecionada: fundo `primary`, texto `textOnPrimary`.

### SelectField

Campo com a aparência do TextField que abre uma folha inferior com a lista de opções (`FlatList`). Use para listas longas, como idade.

### ProgressSteps

Barra segmentada de fluxos em etapas (onboarding). Segmentos feitos em `primary`, restantes em `track`.

### Toast

Aviso passageiro no topo (`showToast({ tone, title, message })`, 4 s, toque fecha). `success` ou `error` (erro que não é de campo). `<ToastHost />` fica na raiz.

TextField aceita `icon` (Ionicons) decorativo à esquerda. Com `secureTextEntry`, mostra sozinho o botão de olho para mostrar/ocultar a senha.

## Do's and Don'ts

### Do:

- Monte telas só com `@/design-system`. Faltou algo, adicione lá e documente aqui.
- Escreva o texto de interface em português do Brasil, com "você".
- Verifique contraste (4.5:1 texto, 3:1 texto grande) ao criar qualquer papel de cor.
- Mantenha rótulo visível acima de todo campo.

### Don't:

- Não use hex, tamanho de fonte ou espaçamento numérico direto em telas.
- Não use coral para texto pequeno (`primary`), nem mais de um botão principal por tela.
- Não adicione sombra, gradiente, cartão ou efeito de vidro.
- Não use `fontWeight`/`fontStyle` com as fontes do app.
- Não mostre foto de outra pessoa antes do match.
