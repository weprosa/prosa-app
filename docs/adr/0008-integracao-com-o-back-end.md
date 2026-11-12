# 0008. Integração com o back-end Laravel

- Status: Proposto (aguarda acordo com os responsáveis de back-end e de IA)
- Data: 2026-11-09

## Contexto

O back-end será em PHP com Laravel e ainda não existe. A parte de IA ainda não foi discutida. O app precisa de uma camada de API desde já, sem fingir que o contrato está fechado.

## Decisão

Já vale para o app:

- O app fala **só com o back-end**, por HTTPS e JSON. **Nunca chama um modelo de IA diretamente** e não guarda chave nem prompt de IA.
- Toda chamada passa por `src/lib/api/client.ts`. A URL base vem de `EXPO_PUBLIC_API_URL`.
- Variáveis `EXPO_PUBLIC_*` são públicas. Nenhum segredo entra no app.
- O token de sessão fica no `expo-secure-store` (Keychain / Keystore), nunca em AsyncStorage.
- Estado de servidor com TanStack Query.
- A regra "foto só depois do match" é garantida **no servidor**: a API não devolve URL de foto de quem ainda não deu match. O app não recebe a foto para depois escondê-la.

Proposto, a confirmar com o back-end:

- Autenticação por token (Laravel Sanctum), enviado como `Authorization: Bearer`.
- Rotas `POST /auth/login` e `POST /auth/register`, respondendo `{ "token": "..." }`.
- Erros de validação no formato padrão do Laravel (422 com `message` e `errors` por campo), que o cliente já entende.
- Login com Google e Apple: o fluxo depende do back-end. Os botões existem nas telas, sem ação.

## Consequências

- Sem back-end, os formulários de entrar e criar conta validam os campos e depois mostram erro de conexão.
- `src/features/auth/auth-service.ts` muda quando o contrato for fechado.
- Falta um lugar comum, fora deste repositório, para o contrato da API (OpenAPI, por exemplo). Decidir com a equipe.
- Em produção na App Store, oferecer login com Google obriga a oferecer também o da Apple.
