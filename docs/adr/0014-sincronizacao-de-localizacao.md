# 0014. Sincronização de localização

- Status: Proposto
- Data: 2026-11-24

## Contexto

O match depende de encontrar pessoas próximas. O back-end calcula a distância com a posição da pessoa e as preferências de busca.

Hoje, o único envio de coordenadas previsto no contrato confirmado é o par opcional `latitude`/`longitude` em `PUT /v1/me/onboarding/profile`. Essa rota exige todos os campos do perfil, por isso não serve para atualizar só a posição. Não existe rota de posição nem de listagem de pessoas próximas. O contrato abaixo é uma proposta, a confirmar com os responsáveis pelo back-end, conforme o [ADR 0008](0008-integracao-com-o-back-end.md).

## Decisão

**Quando sincronizar e como pedir permissão**

- No fim do onboarding, a tela "Tudo pronto" explica por que a localização é necessária. Só depois o app pede permissão de localização em uso, via `src/lib/permissions.ts`, lê a posição e a envia se a permissão for concedida.
- A cada abertura do app e volta do segundo plano, o app lê e envia a posição somente se a permissão já estiver concedida. Essas chamadas nunca mostram o diálogo de permissão do sistema, respeitando o [ADR 0006](0006-permissoes.md).
- Com permissão negada ou bloqueada, o app continua utilizável. A proposta é que o back-end use a cidade do perfil ou a última posição conhecida. Em caso de bloqueio, a tela explica e oferece abrir os Ajustes, como prevê o ADR 0006.

**Precisão e deduplicação**

- O app arredonda latitude e longitude para duas casas decimais antes do envio, com precisão de cerca de 1 km. Isso segue o princípio de precisão mínima do ADR 0006 e o arredondamento já confirmado no ADR 0008.
- A mesma posição, comparada depois do arredondamento, não é reenviada em menos de 10 minutos. Chamadas simultâneas compartilham uma única operação de sincronização, exceto um pedido com permissão (`prompt: true`) que chega durante um envio silencioso: ele espera o silencioso terminar e roda o seu, para o diálogo aparecer.
- A volta ao app só conta depois de o app ir para o segundo plano. No iOS, o diálogo de permissão e a Central de Controle deixam o app `inactive` por um instante, e isso não dispara envio.

**Código e chave de ativação**

- `src/lib/location-sync.ts` concentra `syncLocation` e `LOCATION_API_ENABLED`. O contrato de `syncLocation` recebe `LocationSyncOptions` e devolve `LocationSyncResult`, sem lançar erro.
- `src/features/onboarding/story/story-done-screen.tsx` é o ponto previsto para chamar `syncLocation({ prompt: true })`, depois da explicação na tela "Tudo pronto".
- `src/lib/use-location-sync.ts` é o hook previsto no layout raiz para a abertura do app e a volta do segundo plano, usando `syncLocation({ prompt: false })`.
- `LOCATION_API_ENABLED` permanece em `false` até o back-end publicar a rota e o contrato ser confirmado. Com `false`, a sincronização não faz nenhuma chamada de rede.

**Contrato proposto (não publicado pelo back-end)**

Toda chamada usa `src/lib/api/client.ts`, com autenticação `Authorization: Bearer <token>` e as regras de sessão do ADR 0008.

| Método | Rota              | Corpo                     | Resposta de sucesso |
| ------ | ----------------- | ------------------------- | ------------------- |
| PUT    | `/v1/me/location` | `{ latitude, longitude }` | 204, sem corpo      |

- `latitude` e `longitude` são números obrigatórios, nos intervalos inclusivos −90..90 e −180..180, respectivamente.
- O servidor também arredonda as coordenadas para duas casas decimais e as grava com a data de atualização.
- A resposta proposta é 204, sem corpo. Também é aceita uma resposta 200 com `{ location: { latitude, longitude, updated_at } }`, em que `updated_at` é uma data ISO 8601. O app ignora o corpo da resposta de sucesso.
- Erro esperado de validação: 422 no formato já usado, `{ message: "Dados inválidos.", code: "validation_error", errors }`, com `errors` por campo.
- Erro esperado de autenticação: 401, tratado pelo cliente de API com o fluxo de renovação e expiração de sessão do ADR 0008.

**Listagem de pessoas próximas (proposta, fora do escopo deste ADR para o app)**

O back-end usa a última posição salva e `maximum_distance_km` das preferências para calcular a proximidade. O app não precisa mandar coordenadas em cada listagem. Este ADR não define uma rota de listagem.

## Consequências

- Para ativar o envio, o back-end precisa publicar a rota e confirmar o contrato; depois, o app muda `LOCATION_API_ENABLED` para `true`.
- Enquanto a chave estiver em `false`, nenhuma coordenada é enviada pela sincronização. Continua apenas o envio que a etapa de perfil já faz pelo contrato confirmado.
- Continua sem existir uma forma de a pessoa retirar a localização já compartilhada, pendência registrada no ADR 0008. Negar ou revogar a permissão não apaga a posição salva no servidor.
- Localização em segundo plano segue fora do MVP. A sincronização ocorre com o app em uso, inclusive ao voltar do segundo plano.
