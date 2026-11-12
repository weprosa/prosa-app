# Prosa (app)

App iOS e Android do **Prosa**, um app para conhecer pessoas em que a afinidade vem antes da foto.

> Antes do rosto, a pessoa.

## O que é o Prosa

A ideia lembra o Tinder, com uma diferença: antes de ver qualquer perfil, você passa por um onboarding e responde a uma série de perguntas (por exemplo, o que gosta de fazer). Com essas respostas, a IA monta uma análise do seu perfil e procura pessoas com perfil parecido. Só quando o match acontece você recebe as fotos, e a partir daí pode conversar, trocar fotos e marcar encontros.

O objetivo atual é um **MVP funcional**.

## Equipe e repositórios

Cada parte tem seu repositório, lado a lado na pasta `prosa/`:

| Parte    | Tecnologia          | Repositório        |
| -------- | ------------------- | ------------------ |
| App      | Expo + React Native | `prosa-app` (este) |
| Back-end | PHP + Laravel       | a criar            |
| IA       | a definir           | a criar            |

O app fala só com o back-end; a IA fica atrás dele.

## Estado atual

- Projeto configurado: Expo SDK 58, React Native 0.88, Expo Router, TypeScript estrito, React Compiler.
- Design system em `src/design-system` (tokens e componentes).
- Três telas: boas-vindas, entrar e criar conta, com validação de formulário.
- Permissões de localização (em uso) e câmera/fotos declaradas em `app.config.ts`.

Ainda não existe: back-end (o envio dos formulários responde "não foi possível conectar"), login com Google/Apple, recuperação de senha, onboarding, ícone e logotipo próprios, identificadores do app nas lojas.

## Como rodar

Requisitos: Node 22.13 ou mais novo (LTS 22 ou 24).

```bash
npm install
cp .env.example .env.local
npm start
```

Com o servidor rodando, abra no celular com o [Expo Go](https://expo.dev/go) (leia o QR code), ou pressione `i` (simulador iOS, exige Xcode), `a` (emulador Android, exige Android Studio) ou `w` (preview no navegador).

Quando entrar uma biblioteca nativa que o Expo Go não traz, será preciso um development build: `npx eas-cli@latest build --profile development`.

## Comandos

| Comando          | O que faz                                   |
| ---------------- | ------------------------------------------- |
| `npm start`      | Servidor de desenvolvimento                 |
| `npm run check`  | Typecheck, lint e verificação de formatação |
| `npm run format` | Formata o código com Prettier               |
| `npm run doctor` | Diagnostica dependências e configuração     |

Para instalar pacotes use sempre `npx expo install <pacote>`.

## Estrutura

```
src/
  app/             Rotas (Expo Router). Só roteamento.
  features/        Telas e lógica por área (hoje: auth).
  design-system/   Tokens e componentes de UI.
  lib/             API, sessão, permissões, env.
docs/adr/          Decisões de arquitetura (ADRs).
app.config.ts      Configuração do app, plugins e textos de permissão.
```

## Documentação

- [AGENTS.md](AGENTS.md): regras e limites para quem (ou o que) escreve código aqui. `CLAUDE.md` aponta para ele.
- [PRODUCT.md](PRODUCT.md): o produto, seus princípios e o que ainda não foi decidido.
- [DESIGN.md](DESIGN.md): o design system.
- [docs/adr/](docs/adr/README.md): decisões de arquitetura.
