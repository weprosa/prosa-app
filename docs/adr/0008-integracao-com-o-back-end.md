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

Confirmado para o onboarding (OpenAPI "Prosa API 0.0.1" e código do prosa-api main 235b623, revisado em 2026-11-26):

- Todas as rotas abaixo exigem autenticação Bearer e respondem `{ user: OnboardingUser }`. Os tipos do contrato ficam em `src/features/onboarding/onboarding-service.ts`.
- `GET /v1/me/onboarding` e as respostas dos PUTs devolvem perfil, coordenadas, `onboarding_completed` (booleano) e `preferences`. Os campos de endereço estão sempre presentes, como texto ou `null`. `preferences` também está sempre presente, como objeto ou `null`; `onboarding-service.ts` normaliza `null` para um objeto com campos nulos.
- `PUT /v1/me/onboarding/profile`: exige `nickname` (até 100 caracteres), `birth_date` (`YYYY-MM-DD`, 18 anos ou mais) e `gender_identity` (`woman`, `man`, `non_binary`). Aceita endereço opcional ou `null`: `postal_code` (até 20 caracteres), `street` (até 255), `neighborhood`, `city` e `state` (até 100 cada). Cidade é obrigatória no app. O app envia CEP com 8 dígitos, logradouro sem número com até 150 caracteres e UF de 2 letras; esses limites são do app. Detalhes no [ADR 0013](0013-endereco-por-cep.md).
- `latitude` e `longitude` são opcionais, mas uma exige a outra, nos intervalos −90..90 e −180..180; o servidor arredonda para duas casas decimais. Se nenhuma for enviada no PUT de perfil, o back-end grava ambas como `null`, apagando coordenadas anteriores.
- O 422 responde `{ message: "Dados inválidos.", code: "validation_error", errors }`, com mensagens por campo em pt-BR. O app passa a mostrar essas mensagens junto aos campos, além da validação local.
- `PUT /v1/me/onboarding/preferences`: exige `minimum_age` (18..100), `maximum_age` (entre o mínimo e 100), `maximum_distance_km` (1..500), `target_genders` (1..3 gêneros, sem repetição), `relationship_intention` (`serious_relationship`, `casual`, `open_to_exploring`) e `target_child_situation` (`has_children`, `wants_children`, `does_not_want_children`, `open_to_children`). O app limita o slider de distância a 100 km e representa o máximo de idade 100 como "50+".
- `PUT /v1/me/onboarding/lifestyle`: aceita campos opcionais/nulos `alcohol_frequency` e `smoking_frequency` (`never`, `social`, `frequent`), `religion_id` (inteiro existente) e `religion_importance` (`low`, `medium`, `high`). Ao salvar a etapa 3, marca `onboarding_completed` como `true`, mesmo com tudo vazio.
- A etapa 1 guarda `target_genders` apenas no cache em memória até o PUT de preferências da etapa 2. A entrada `/onboarding` consulta o servidor e usa `onboarding_completed` para seguir à narrativa sem repetir o onboarding concluído. Se ainda não foi concluído, perfil incompleto ou `relationship_intention === null` leva à etapa 1; preferências salvas levam à etapa 3.

Pendências do onboarding:

- `GET /v1/religions` (público) agora devolve o catálogo `{ religions: [{ id, name, sort_order }] }`, mas o app ainda usa `RELIGION_OPTIONS`, lista fixa que espelha os IDs e nomes do `ReligionSeeder`. Trocar pela consulta ao catálogo é a próxima pendência da etapa 3.
- A API não aceita "Prefiro não dizer" para gênero. As novas opções compartilhadas contêm apenas Homem, Mulher e Não-binário.
- Trocar o interesse na etapa 1 depois de salvar as preferências exige um segundo PUT (`/preferences`) com todos os campos, porque `target_genders` só existe ali.

Proposto, sem rota no back-end:

- Narrativa do onboarding (`/v1/profile/story`): contrato e chave de ativação no [ADR 0011](0011-narrativa-do-onboarding.md).

## Consequências

- Autenticação e dados iniciais do onboarding usam os contratos confirmados; a narrativa continua com API desativada até a publicação das rotas.
- Novos endpoints só entram no app depois de confirmados no contrato OpenAPI compartilhado pelo back-end.
- Em produção na App Store, oferecer login com Google obriga a oferecer também o da Apple.
