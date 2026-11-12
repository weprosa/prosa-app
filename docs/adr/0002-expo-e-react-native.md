# 0002. Expo, React Native e Expo Router

- Status: Aceito
- Data: 2026-11-09

## Contexto

O app precisa sair para iOS e Android com uma pessoa só cuidando dele.

## Decisão

- Expo SDK 58 com React Native 0.88 (New Architecture) e TypeScript estrito.
- Navegação com Expo Router (rotas por arquivo em `src/app`, rotas tipadas).
- Continuous Native Generation: `ios/` e `android/` não são versionados nem editados. Configuração nativa fica em `app.config.ts` e em config plugins.
- Builds e envio às lojas pelo EAS (`eas.json` com perfis `development`, `preview` e `production`).
- Expo Go enquanto bastar; development build quando entrar a primeira biblioteca nativa que ele não traz.
- React Compiler ligado.
- Web serve só como preview de desenvolvimento. Não é plataforma de entrega.

## Consequências

- Uma base de código para as duas plataformas, sem Xcode ou Android Studio para o dia a dia.
- Bibliotecas sem config plugin ficam de fora, ou exigem escrever um.
- Cada SDK novo traz mudanças que quebram. Atualize um SDK por vez e consulte a doc versionada.
- Faltam os identificadores (`ios.bundleIdentifier`, `android.package`), que dependem da organização e das contas nas lojas.
