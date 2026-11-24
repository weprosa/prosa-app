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
| `surface`           | `#F4F1EC` | Fundo suave de avisos e do controle segmentado    |
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

`surface` é um branco quente da paleta (`sand100`). Texto `textSecondary` sobre esse fundo mantém contraste de aproximadamente 6:1, acima do mínimo de 4.5:1.

## Typography

Playfair Display (serifada) e Inter (sem serifa), carregadas em `src/app/_layout.tsx`. Cada peso é um arquivo: escolha a variante, nunca `fontWeight` ou `fontStyle`.

| Variante          | Fonte             | Tamanho / linha | Uso                                  |
| ----------------- | ----------------- | --------------- | ------------------------------------ |
| `display`         | Playfair Regular  | 44 / 52         | Frase de abertura                    |
| `displayItalic`   | Playfair Italic   | 44 / 52         | Trecho de ênfase dentro do `display` |
| `title`           | Playfair Regular  | 34 / 42         | Título de tela                       |
| `wordmark`        | Playfair SemiBold | 30 / 36         | A marca "Prosa"                      |
| `heading`         | Playfair Regular  | 22 / 30         | Título de capítulo em listas         |
| `body`            | Inter Regular     | 17 / 26         | Texto corrido e texto de campo       |
| `bodySmall`       | Inter Regular     | 15 / 22         | Apoio, erro, rodapé                  |
| `label`           | Inter SemiBold    | 15 / 20         | Rótulo de campo                      |
| `eyebrow`         | Inter SemiBold    | 13 / 18         | Nome do capítulo acima da pergunta   |
| `link`            | Inter SemiBold    | 15 / 22         | Link em linha                        |
| `button`          | Inter Bold        | 17 / 22         | Botão principal                      |
| `buttonSecondary` | Inter SemiBold    | 16 / 22         | Botão secundário                     |

**Serifa é voz, não interface.** Playfair só em título e marca. Nada que se toca ou se preenche usa serifa.

`eyebrow` usa letras maiúsculas (`textTransform: 'uppercase'`), espaçamento entre letras de 1.2 e cor `link` ao apresentar o nome do capítulo acima da pergunta.

A escala de fonte do sistema é respeitada até 1.4x (`MAX_FONT_SCALE`). Componentes usam altura mínima, não fixa, para crescer junto.

## Layout

- Espaçamento em múltiplos de 4: `xxs` 4, `xs` 8, `sm` 12, `md` 16, `lg` 24, `xl` 32, `xxl` 48.
- Margem lateral de tela: 28 (`spacing.screen`), aplicada por `Screen`.
- Conteúdo com largura máxima de 480, centralizado em telas largas.
- Campo de várias linhas: altura mínima de 160 (`sizes.textArea`); pode crescer com o conteúdo ou ocupar a altura livre com `fill`.
- Campos lado a lado: largura de referência de 140 (`sizes.fieldMinWidth`) em `flexBasis` a 1x, multiplicada pela escala de fonte até `MAX_FONT_SCALE`, com `flexGrow` para dividir o espaço e `flexWrap` na linha para empilhar quando não couberem. Nascimento e Cidade cabem juntos em 393 pt com a fonte padrão e empilham com fontes grandes.
- Ditado: botão de 72 (`sizes.dictationButton`), ícone de 28 (`sizes.dictationIcon`), halo de 80 (`sizes.dictationHalo`) e área reservada de 112 (`sizes.dictationControl`) para acomodar sua expansão sem deslocar o conteúdo.
- Sliders: trilho de 4 (`sizes.sliderTrack`) e polegar de 24 (`sizes.sliderThumb`) dentro de um alvo de 48 (`sizes.touchTarget`). O calendário usa ícone de 20 (`sizes.fieldIcon`).
- Itens de um mesmo grupo ficam a 8–16; grupos diferentes, a 24–32.
- Uma coluna. A ação principal fica onde o polegar alcança; o link de alternância ("Já tem conta?") fica no pé.

## Elevation & Depth

Não há sombra nem elevação. Separação é feita por espaço, contorno de 1px ou linha divisória. Se algo parecer precisar de sombra, revise a hierarquia antes.

## Shapes

- Botões: pílula (`radii.pill`).
- Campos: cantos de 14 (`radii.field`).
- Contornos de 1px. O sublinhado de link tem 1.5px, feito com borda para ter respiro do texto.
- Novos controles usam `borderWidths.default` (1) no campo e `borderWidths.emphasis` (2) no polegar do slider.

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

### DictationButton

Controle circular de ditado, independente da gravação. Props: `listening`, `busy` (opcional), `level` (`SharedValue<number>` entre 0 e 1 do Reanimated), `onPress`, `disabled` (opcional), `accessibilityLabel` obrigatório e `accessibilityHint` opcional.

- Fundo `primary`, ícone Ionicons em `textOnPrimary`: `mic` em repouso e `stop` durante a escuta. O círculo usa `sizes.dictationButton` (72), o ícone `sizes.dictationIcon` (28) e cantos `radii.pill`.
- Halo decorativo em `primary`, com diâmetro `sizes.dictationHalo` (80), dentro da área `sizes.dictationControl` (112). Durante a escuta, opacidade de 18% e escala de 1 a 1.35 conforme `level`, suavizada em 100 ms na thread de UI. Entrada e saída por opacidade em 150 ms; anima apenas `transform` e `opacity`.
- Pressionado: fundo `primaryPressed` e escala de 0.96. Com redução de movimento, o halo fica estático e o botão não muda de escala; o fundo ainda responde ao toque.
- `busy`: indicador de atividade em `textOnPrimary`, bloqueando toques enquanto prepara ou finaliza o ditado. `disabled`: opacidade de 45% e toques bloqueados.
- Papel acessível `button`, estados `busy` e `disabled`; halo e ícone são decorativos. A tela fornece o rótulo de começar/parar e o texto de status, com região acessível de atualização educada.

### Inputs / Fields

`TextField`: rótulo sempre visível acima do campo (placeholder é exemplo, não rótulo), altura mínima 52.

- Estados: padrão (contorno cinza), foco (contorno escuro), erro (contorno e mensagem em `danger` logo abaixo).
- Mensagem de erro diz o problema e o que fazer: "Use pelo menos 8 caracteres."
- Validação acontece ao enviar. Preencha sempre `autoComplete`, `textContentType`, `keyboardType` e `returnKeyType`, e encadeie o foco para o campo seguinte.
- `iconAction` opcional torna o `icon` à esquerda tocável: recebe `onPress`, `accessibilityLabel` obrigatório, `disabled` e `busy`. Tem alvo de `sizes.touchTarget` (48), fundo `backgroundPressed` ao pressionar e indicador de atividade em `busy`, que também bloqueia novos toques. Sem `iconAction`, o ícone permanece decorativo e o comportamento anterior é preservado.

### TextLink

Link em linha, coral escuro, sublinhado por padrão. `hitSlop` amplia a área de toque.

### Divider

Linha de 1px, com rótulo opcional no meio ("ou").

### Wordmark

A marca "Prosa" em texto. Substituir por logotipo quando existir.

### ChipGroup

Escolha única entre poucas opções, em pílulas que quebram linha (altura de toque 48). Selecionada: fundo `primary`, texto `textOnPrimary`.

`allowDeselect` opcional permite tocar novamente na opção selecionada para limpar o valor. Com `allowDeselect: true`, `onChange` recebe `T | null`; sem essa opção, recebe apenas `T`.

### SelectField

Campo com a aparência do TextField que abre uma folha inferior com a lista de opções (`FlatList`). Use para listas longas, como idade.

`clearLabel` opcional acrescenta a primeira linha da lista para limpar a seleção, por exemplo, “Prefiro não informar”. Essa linha emite `null` e fecha a folha; o campo volta ao placeholder. Com `clearLabel`, `onChange` recebe `T | null`; sem a prop, recebe apenas `T` e a linha não aparece.

### DateField

Campo de data com a aparência do SelectField e ícone decorativo `calendar-outline`. Exporta `DateField` e `DateFieldProps`.

- Props obrigatórias: `label`, `placeholder`, `value: string | null` e `onChange: (value: string | null) => void`. Opcionais: `minimumDate`, `maximumDate` e `error`. Datas e limites usam `YYYY-MM-DD`, com limites inclusivos e mínimo anterior ou igual ao máximo. A regra de maioridade pertence à tela, que fornece `maximumDate`.
- Exibe `DD/MM/AAAA`; mantém rótulo visível, altura mínima `sizes.field`, contorno em `border` e ícone `sizes.fieldIcon`. Aberto: contorno `borderFocused`. Erro: contorno e mensagem em `danger`, com anúncio acessível.
- Usa `DateTimePicker` de `@expo/ui/community/datetime-picker`, modo `date`, tema claro e destaque `primary`. No iOS, abre uma folha com picker de rolagem em pt-BR e ações Cancelar/Confirmar. Girar o picker altera só a seleção provisória; cancelar, tocar fora ou usar o gesto de escape descarta a alteração. A folha respeita safe area e redução de movimento.
- No Android, monta o diálogo nativo; `onValueChange` confirma e fecha, `onDismiss` fecha sem emitir alteração. Os botões recebem os textos Confirmar/Cancelar; o idioma do calendário acompanha o sistema.
- Na web, usa `TextField` com ícone de calendário e entrada numérica com máscara `DD/MM/AAAA`; as barras são inseridas automaticamente. Emite `onChange` em `YYYY-MM-DD` quando a data está completa, existe no calendário e respeita os limites inclusivos; nos demais casos, emite `null` para limpar qualquer valor anterior. iOS e Android continuam emitindo apenas datas válidas. Datas completas inválidas ou fora do intervalo mostram o motivo em português, com prioridade para a prop `error`. A digitação parcial ou inválida permanece visível; mudanças externas em `value` sincronizam o texto exibido. Mantém rótulo visível e dica acessível de formato ou erro.
- Ao abrir, começa no valor atual ou, sem valor, em `maximumDate`; sem ambos, usa hoje. A seleção inicial e a confirmada respeitam os limites. Conversões usam ano/mês/dia locais, com meio-dia ao ler datas, sem converter a data local para UTC. Strings inválidas não são passadas ao picker.

### Slider / RangeSlider

Controles numéricos controlados, exportados com `SliderProps` e `RangeSliderProps`. O consumidor atualiza `value` em `onChange` e fornece a apresentação em `valueText` (por exemplo, “até 30 km” ou “25 – 35”).

- Props comuns obrigatórias: `label`, `valueText`, `min`, `max`, `value`, `onChange`, `minLabel` e `maxLabel`. `step` é opcional e vale 1. Limites, passo e distância são inteiros; `min ≤ max`, `step > 0`. O valor recebido é ajustado à grade e aos limites, sem emitir alteração na montagem. `max` permanece selecionável mesmo quando o último intervalo é menor que `step`.
- `Slider`: `value: number`, `onChange: (value: number) => void` e `accessibilityValueText?: string` (usa `valueText` quando omitido).
- `RangeSlider`: `value: readonly [number, number]`, `onChange: (value: [number, number]) => void` e `minDistance?: number` (padrão 0, entre 0 e `max - min`). A distância é respeitada na grade; os polegares podem coincidir quando ela vale zero, mas nunca se cruzam.
- Rótulo à esquerda, valor em `link` à direita (contraste para texto pequeno), legendas em `textSecondary` abaixo. Trilho `track`, trecho selecionado `primary`, polegar branco (`background`) com borda `primary`, sem sombra. O cabeçalho quebra linha quando necessário para acomodar texto ampliado.
- A largura é medida por `onLayout`. Cada polegar ocupa `sizes.touchTarget` (48 × 48), com centros recuados em meia área de toque nas extremidades. O arraste escolhe o polegar mais próximo; se coincidirem, arrastar para a esquerda move o mínimo e para a direita move o máximo. Movimentos verticais antes da ativação cedem à rolagem da tela.
- Gestos usam `usePanGesture`/`GestureDetector` do Gesture Handler 3; posições e trecho ativo são atualizados na thread de UI com Reanimated, animando apenas `transform`. Não há inércia nem movimento decorativo. `onChange` chega à thread JS apenas quando o passo muda, inclusive por acessibilidade; limites não geram chamadas repetidas. O estado controlado é reconciliado ao encerrar ou cancelar o arraste.
- Cada polegar tem papel `adjustable`, rótulo próprio (mínimo/máximo na faixa), `accessibilityValue` com limites numéricos e descrição legível e ações `increment`/`decrement`. Na web, aceita foco por Tab e ajuste pelas setas. Na raiz do app, `GestureHandlerRootView` envolve os provedores e as rotas.

### ProgressSteps

Barra segmentada de fluxos em etapas (onboarding). Segmentos feitos em `primary`, restantes em `track`.

### Toast

Aviso passageiro no topo (`showToast({ tone, title, message })`, 4 s, toque fecha). `success` ou `error` (erro que não é de campo). `<ToastHost />` fica na raiz.

TextField aceita `icon` (Ionicons) decorativo à esquerda. Com `secureTextEntry`, mostra sozinho o botão de olho para mostrar/ocultar a senha.

### TextArea

Campo de texto com várias linhas, alinhado ao topo. Props: `accessibilityLabel` obrigatório, `label`, `hint`, `error`, `fill`, `ref` (mesmo `TextFieldRef`) e props de TextInput, exceto `style`, `placeholderTextColor` e `multiline`.

- Rótulo visível opcional em `label`: o título da tela pode cumprir esse papel, mas o campo sempre precisa de `accessibilityLabel`.
- Mesmo contorno e fonte do TextField, cantos `radii.field`, margem interna `spacing.md` e altura mínima `sizes.textArea` (160).
- Foco usa `borderFocused`; erro usa contorno `danger` e substitui o `hint` por mensagem `bodySmall` em `danger`. O apoio usa `bodySmall` em `textSecondary`.
- `fill` aplica `flex: 1` ao contêiner e ao campo para ocupar a altura livre. `ref` permite chamar `.focus()`; seleção e cursor usam `primary`, com escala de fonte até `MAX_FONT_SCALE`.

### SegmentedControl

Escolha única em abas de mesma largura. Props: `options` (lista de `SegmentedOption<T>` com `value`, `label` e `icon` opcional), `value`, `onChange` e `accessibilityLabel` obrigatório.

- Trilho em pílula com fundo `surface` e margem interna `spacing.xxs`.
- Cada aba tem altura mínima `sizes.touchTarget` (48), texto `label` e ícone Ionicons opcional de 18 em `text`, separado por `spacing.xs`.
- Selecionada: fundo `background`, contorno de 1px em `border`, texto `text`. As demais ficam transparentes, com texto `textSecondary`. Sem sombra.
- Leitor de tela recebe o grupo como `tablist`, cada opção como `tab` e o estado `selected`.

### Notice

Aviso de apoio junto ao conteúdo. Props: `message` e `icon` (Ionicons) opcional.

Fundo `surface`, cantos `radii.field`, margem interna `spacing.md`. Ícone decorativo de 18 em `text`, separado por `spacing.sm` do texto `bodySmall` em `textSecondary`. O texto ocupa o espaço restante e quebra linha.

### TextButton

Botão de texto sem sublinhado. Props: `label`, `tone` e props de Pressable, exceto `children` e `style`.

- `default`: texto `label` em `text`.
- `muted`: texto `bodySmall` em `textSecondary`, para ações discretas.
- Conteúdo centralizado, altura mínima `sizes.touchTarget` (48), margem interna horizontal e `hitSlop` de `spacing.xs`. Ao pressionar, opacidade de 0.6. Leitor de tela recebe o papel `button`.

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
