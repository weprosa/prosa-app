# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Users

Adultos no Brasil que querem conhecer alguém para se relacionar e estão cansados de escolher (e ser escolhidos) só pela foto. Usam o app no celular, em momentos curtos e pessoais.

## Product Purpose

O Prosa é um app para conhecer pessoas. Antes de ver qualquer perfil, a pessoa passa por um onboarding de perguntas (por exemplo, o que gosta de fazer). Com as respostas, a IA monta uma análise do perfil dela e depois procura pessoas com perfil parecido. Só quando o match acontece as fotos aparecem, e a partir daí as duas pessoas podem conversar, trocar fotos e marcar encontros.

O objetivo atual é um MVP funcional.

## Positioning

Em apps como o Tinder, a foto vem primeiro e a conversa depois. No Prosa a ordem é invertida: a afinidade é calculada pelo que a pessoa conta, e a foto só é revelada depois do match. "Antes do rosto, a pessoa."

## Operating Context

- Equipe de três: app (este repositório), back-end em PHP/Laravel, e IA. Cada um com seu repositório dentro da pasta `prosa/`.
- O app conversa só com o back-end. A IA fica atrás dele.
- Fluxo: boas-vindas → criar conta ou entrar → onboarding de perguntas → análise do perfil → matches → fotos reveladas → conversa.

## Capabilities and Constraints

Confirmado:

- iOS e Android, com Expo e React Native.
- Telas de boas-vindas, entrar e criar conta (e-mail e senha; botões de Google e Apple previstos).
- Localização (para encontrar pessoas por perto) e câmera/fotos são permissões prováveis.
- Tema claro apenas no MVP.

Ainda não decidido:

- Contrato da API e método de autenticação (depende do back-end).
- Como a IA analisa o perfil e calcula afinidade (depende do responsável de IA).
- Perguntas do onboarding, regras de match, funcionamento do chat e do agendamento de encontros.
- Idade mínima, verificação de identidade, denúncia e bloqueio.
- Nome da organização, identificadores do app nas lojas, ícone e logotipo.

## Brand Commitments

- Nome: Prosa. Marca em texto, serifada, na cor coral.
- Frase: "Antes do rosto, a pessoa."
- Voz: português do Brasil, direto e caloroso, trata por "você" e fala de si como "a gente".
- Playfair Display nos títulos, Inter no texto, coral como única cor de destaque, fundo branco. Definidos pelos mockups das três primeiras telas.

## Evidence on Hand

- Mockups de boas-vindas, entrar e criar conta, implementados em `src/features/auth/`.
- Não há ícone, logotipo, splash, fotos, depoimentos nem números. Os ícones em `assets/` são os do template do Expo e precisam ser substituídos. Não invente nenhum desses.

## Product Principles

1. A pessoa antes do rosto: nada de foto de terceiros antes do match.
2. Conversa é o produto: o que a pessoa escreve vale mais que qualquer efeito visual.
3. Pedir só o necessário, na hora em que faz sentido (dados, permissões, passos).
4. Dado pessoal é sensível por padrão: respostas, localização e fotos são tratadas como tal.

## Accessibility & Inclusion

Contraste mínimo de 4.5:1 em texto, alvos de toque de 48pt, suporte a leitor de tela e a tamanho de fonte ampliado do sistema (até 1.4x).
