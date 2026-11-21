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

Confirmado (doc OpenAPI "Prosa API 0.0.1", 2026-11-14):

- Base: `https://prosa-api-production-xrtdnk.laravel.cloud/api` (health check em `/up`). Em `.env` para dev e em `eas.json` para os builds.
- `POST /v1/auth/register` (201) e `POST /v1/auth/login` (200) respondem `{ user, token: { access_token, token_type: "Bearer", expires_in } }`. Token enviado como `Authorization: Bearer`.
- `POST /v1/auth/google`, sem autenticação, recebe `{ id_token: string }` (máximo 8192) e responde 200 com `{ user, token: { access_token, token_type: "Bearer", expires_in } }`. Erros: 401 `invalid_google_token` ("Token do Google inválido."), 409 `social_account_conflict` (e-mail já vinculado a outra conta Google), 422 de validação e 429 por limite de 5 chamadas por minuto por IP.
- Erros: 422 com `message`, `code` e `errors` por campo; login inválido é 401 `invalid_credentials`.
- Sessão (JWT, 60 min): o app guarda token e validade no SecureStore e renova com `POST /v1/auth/refresh` quando faltam menos de 5 min, ou uma vez após um 401, com uma renovação por vez. Token já expirado não é renovado: a pessoa entra de novo (decisão de produto, 2026-11-14). Ao abrir o app, sessão válida é conferida com `GET /v1/auth/user`.
- Existem também `GET /v1/auth/user`, `POST /v1/auth/refresh`, `POST /v1/auth/logout`, verificação de e-mail e redefinição de senha, ainda não usados pelo app.
- Login com Google ligado (ver [ADR 0010](0010-login-com-google.md)); Apple ainda sem ação.

Proposto, sem rota no back-end:

- Narrativa do onboarding (`/v1/profile/story`): contrato e chave de ativação no [ADR 0011](0011-narrativa-do-onboarding.md).

## Consequências

- Sem back-end, os formulários de entrar e criar conta validam os campos e depois mostram erro de conexão.
- `src/features/auth/auth-service.ts` muda quando o contrato for fechado.
- Falta um lugar comum, fora deste repositório, para o contrato da API (OpenAPI, por exemplo). Decidir com a equipe.
- Em produção na App Store, oferecer login com Google obriga a oferecer também o da Apple.
