# 0008. Integração com o back-end Laravel

- Status: Proposto (aguarda acordo com os responsáveis de back-end e de IA)
- Data: 2026-11-09

## Contexto

O back-end é em PHP com Laravel. Autenticação e os dados iniciais do onboarding já têm contrato publicado; a integração da narrativa e da IA ainda depende de acordo com os responsáveis.

## Decisão

Já vale para o app:

- O app fala **só com o back-end**, por HTTPS e JSON. **Nunca chama um modelo de IA diretamente** e não guarda chave nem prompt de IA.
- Toda chamada passa por `src/lib/api/client.ts`. A URL base vem de `EXPO_PUBLIC_API_URL`.
- Variáveis `EXPO_PUBLIC_*` são públicas. Nenhum segredo entra no app.
- O token de sessão fica no `expo-secure-store` (Keychain / Keystore), nunca em AsyncStorage.
- Estado de servidor com TanStack Query.
- A regra "foto só depois do match" é garantida **no servidor**: a API não devolve URL de foto de quem ainda não deu match. O app não recebe a foto para depois escondê-la.

Confirmado (doc OpenAPI "Prosa API 0.0.1", 2026-11-14):

- Base: `https://prosa-api-production-xrtdnk.laravel.cloud/api` (health check em `/up`). Em `.env` para dev e em `eas.json` para os builds.
- `POST /v1/auth/register` (201) e `POST /v1/auth/login` (200) respondem `{ user, token: { access_token, token_type: "Bearer", expires_in } }`. Token enviado como `Authorization: Bearer`.
- `POST /v1/auth/google`, sem autenticação, recebe `{ id_token: string }` (máximo 8192) e responde 200 com `{ user, token: { access_token, token_type: "Bearer", expires_in } }`. Erros: 401 `invalid_google_token` ("Token do Google inválido."), 409 `social_account_conflict` (e-mail já vinculado a outra conta Google), 422 de validação e 429 por limite de 5 chamadas por minuto por IP.
- Erros: 422 com `message`, `code` e `errors` por campo; login inválido é 401 `invalid_credentials`.
- Sessão (JWT, 60 min): o app guarda token e validade no SecureStore e renova com `POST /v1/auth/refresh` quando faltam menos de 5 min, ou uma vez após um 401, com uma renovação por vez. Token já expirado não é renovado: a pessoa entra de novo (decisão de produto, 2026-11-14). Ao abrir o app, sessão válida é conferida com `GET /v1/auth/user`.
- Existem também `GET /v1/auth/user`, `POST /v1/auth/refresh`, `POST /v1/auth/logout`, verificação de e-mail e redefinição de senha, ainda não usados pelo app.
- Login com Google ligado (ver [ADR 0010](0010-login-com-google.md)); Apple ainda sem ação.

Confirmado para o onboarding (OpenAPI "Prosa API 0.0.1", 2026-11-21):

- Todas as rotas abaixo exigem autenticação Bearer e respondem `{ user: OnboardingUser }`. Os tipos do contrato ficam em `src/features/onboarding/onboarding-service.ts`.
- `GET /v1/me/onboarding`: devolve perfil, coordenadas e preferências atuais, com campos ainda não preenchidos em `null`. Antes de salvar qualquer preferência, `preferences` vem `null` (a OpenAPI declara objeto); `onboarding-service.ts` normaliza para um objeto com campos nulos.
- `PUT /v1/me/onboarding/profile`: recebe `nickname` (até 100 caracteres), `birth_date` (`YYYY-MM-DD`, anterior a hoje), `gender_identity` (`woman`, `man`, `non_binary`) e `city` (até 100 caracteres). `latitude` e `longitude` são opcionais, mas uma exige a outra, nos intervalos −90..90 e −180..180; o servidor arredonda para duas casas decimais. O app limita o nascimento a maiores de 18 anos.
- `PUT /v1/me/onboarding/preferences`: exige `minimum_age` (18..100), `maximum_age` (entre o mínimo e 100), `maximum_distance_km` (1..500), `target_genders` (1..3 gêneros, sem repetição), `relationship_intention` (`serious_relationship`, `casual`, `open_to_exploring`) e `target_child_situation` (`has_children`, `wants_children`, `does_not_want_children`, `open_to_children`). O app limita o slider de distância a 100 km e representa o máximo de idade 100 como "50+".
- `PUT /v1/me/onboarding/lifestyle`: aceita campos opcionais/nulos `alcohol_frequency` e `smoking_frequency` (`never`, `social`, `frequent`), `religion_id` (inteiro existente) e `religion_importance` (`low`, `medium`, `high`).
- A etapa 1 guarda `target_genders` apenas no cache em memória até o PUT de preferências da etapa 2. A entrada `/onboarding` consulta o servidor: perfil incompleto ou `relationship_intention === null` leva à etapa 1; preferências salvas e todos os campos de estilo de vida nulos levam à etapa 3; nos demais casos, segue à narrativa.

Pendências do onboarding:

- Não existe GET de catálogo de religiões. `RELIGION_OPTIONS` é uma lista provisória no app que espelha os IDs e nomes do `ReligionSeeder`; precisa ser substituída quando o catálogo for publicado.
- O 422 responde `{ message: "Dados inválidos.", code: "validation_error", errors }`, mas as mensagens por campo estão em inglês. As telas devem validar em pt-BR no cliente; o 422 permanece como proteção adicional.
- Não existe flag de onboarding concluído. A retomada usa os campos preenchidos; quem deixar todo o estilo de vida vazio retorna à etapa 3 ao entrar novamente.
- A API não aceita "Prefiro não dizer" para gênero. As novas opções compartilhadas contêm apenas Homem, Mulher e Não-binário.
- `birth_date` só é validado como anterior a hoje: a API aceita menores de 18 anos. O app bloqueia no cliente, mas a regra precisa existir no servidor.
- `PUT /v1/me/onboarding/profile` sem `latitude`/`longitude` mantém as coordenadas anteriores: não há como a pessoa retirar a localização já compartilhada.
- Trocar o interesse na etapa 1 depois de salvar as preferências exige um segundo PUT (`/preferences`) com todos os campos, porque `target_genders` só existe ali.

Proposto, sem rota no back-end:

- Narrativa do onboarding (`/v1/profile/story`): contrato e chave de ativação no [ADR 0011](0011-narrativa-do-onboarding.md).
- Campos de endereço no perfil (`postal_code`, `street`, `state` em `PUT /v1/me/onboarding/profile` e `GET /v1/me/onboarding`): contrato e chave de ativação no [ADR 0013](0013-endereco-por-cep.md).

## Consequências

- Autenticação e dados iniciais do onboarding usam os contratos confirmados; a narrativa continua com API desativada até a publicação das rotas.
- Novos endpoints só entram no app depois de confirmados no contrato OpenAPI compartilhado pelo back-end.
- Em produção na App Store, oferecer login com Google obriga a oferecer também o da Apple.
