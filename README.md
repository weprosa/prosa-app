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

Ainda não existe: login com Apple, recuperação de senha, onboarding, ícone e logotipo próprios, identificador do app no iOS.

## Como rodar

Requisitos: Node 22.13 ou mais novo (LTS 22 ou 24).

```bash
npm install
cp .env.example .env.local
npm start
```

Com o servidor rodando, abra o app no development build já instalado (veja "Login com Google" abaixo). Para usar o [Expo Go](https://expo.dev/go), rode `npm start -- --go` e leia o QR code; ou pressione `i` (simulador iOS, exige Xcode), `a` (emulador Android, exige Android Studio) ou `w` (preview no navegador).

### Login com Google

O login com Google usa `@react-native-google-signin/google-signin` e exige um development build com `expo-dev-client`. O código nativo da biblioteca não está no Expo Go. No Expo Go e na web, o app mostra uma mensagem ao tentar entrar com Google e continua funcionando.

1. No `.env.local` criado acima (ou em `.env`), defina o client ID do tipo **Web application** do Google Cloud. O valor precisa ser o mesmo de `GOOGLE_CLIENT_ID` no back-end; client ID é público, não é segredo:

   ```dotenv
   EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID=seu-client-id-web
   ```

2. No **mesmo projeto** do client Web no Google Cloud, crie um client OAuth do tipo **Android** com package `com.weprosa.app` (definido em `app.config.ts`) e o SHA-1 do certificado que assina o build. Para builds locais, consulte o debug keystore com `keytool` em `~/.android/debug.keystore` ou `android/app/debug.keystore`; com `android/` já gerado, outra opção é `cd android && ./gradlew signingReport`. Para builds EAS, consulte o certificado com `npx eas-cli@latest credentials`. Sem o package e o SHA-1 correspondentes, o Google devolve `DEVELOPER_ERROR` (código 10).
3. Com o dispositivo Android conectado, compile e abra o app:

   ```bash
   npx expo run:android
   ```

iOS fica fora deste passo: ainda precisa de `ios.bundleIdentifier`, client OAuth iOS e `iosUrlScheme` no plugin, incluído em `app.config.ts` quando `GOOGLE_IOS_URL_SCHEME` estiver definido. A decisão e as pendências estão no [ADR 0010](docs/adr/0010-login-com-google.md).

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
