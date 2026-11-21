# 0010. Login com Google

- Status: Aceito
- Data: 2026-11-16

## Contexto

O back-end Laravel já expõe em produção `POST /v1/auth/google`, que recebe um `id_token` do Google e devolve a mesma sessão do login com e-mail e senha. O contrato está registrado no [ADR 0008](0008-integracao-com-o-back-end.md).

O [ADR 0002](0002-expo-e-react-native.md) permite usar Expo Go enquanto ele bastar e exige development build quando entrar uma biblioteca nativa que ele não traz. O login com Google precisa dessa mudança.

## Decisão

- Usar `@react-native-google-signin/google-signin`, com a API **original**, gratuita, para abrir o seletor nativo de contas e obter o `idToken`. Este passo cobre Android.
- Enviar o token como `id_token` para `POST /v1/auth/google`. O servidor exige que o `aud` seja igual a `GOOGLE_CLIENT_ID`, um client ID do tipo **Web application** no Google Cloud. Se já existir usuário com o mesmo e-mail, o servidor vincula a conta Google e marca o e-mail como verificado; caso contrário, cria a conta com o nome do Google ou a parte do e-mail antes do `@`.
- Configurar `webClientId` com `EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID`, com o **mesmo valor** de `GOOGLE_CLIENT_ID` do back-end. O `idToken` devolvido pela biblioteca tem esse `webClientId` como `aud`. Client ID é público, não é segredo.
- Definir `android.package` como `com.weprosa.app` em `app.config.ts`. No **mesmo projeto** do client Web no Google Cloud, criar um client OAuth do tipo **Android** com esse package e o SHA-1 do certificado que assina o build.
- Para builds locais (`npx expo run:android`), usar o SHA-1 do debug keystore. Consultar com `cd android && ./gradlew signingReport` ou com `keytool` em `~/.android/debug.keystore` ou `android/app/debug.keystore`. Para builds EAS, consultar o certificado com `npx eas-cli@latest credentials`.
- Usar development build com `expo-dev-client`. A biblioteca é carregada sob demanda; no Expo Go e na web, o app mostra uma mensagem e continua funcionando, sem executar o login com Google.
- Deixar iOS fora deste passo. Será preciso definir `ios.bundleIdentifier`, criar um client OAuth iOS e configurar `iosUrlScheme` no plugin. `app.config.ts` só inclui o plugin quando `GOOGLE_IOS_URL_SCHEME` estiver definido. A exigência de Sign in with Apple na App Store continua registrada no [ADR 0008](0008-integracao-com-o-back-end.md).

## Alternativas consideradas

- **`expo-auth-session`:** o Google desaconselha OAuth por navegador embutido em apps nativos, o proxy de OAuth do Expo Go não existe mais e o seletor nativo de contas oferece uma experiência melhor. A biblioteca nativa foi escolhida, com o custo de exigir development build.

## Consequências

- Duas dependências justificadas por este fluxo: `@react-native-google-signin/google-signin` para o login nativo e `expo-dev-client` para o development build. Expo Go deixa de bastar para testar o login com Google.
- O client Web, o client Android e o certificado do build precisam estar configurados no Google Cloud. Sem o client Android com package e SHA-1 correspondentes, o Google devolve `DEVELOPER_ERROR` (código 10).
- O token do Google só serve para obter a sessão do Prosa neste fluxo. A resposta do back-end segue o formato de login já confirmado no ADR 0008.
- iOS ainda depende da configuração própria e do login com Apple para publicação na App Store.
