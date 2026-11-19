# 0011. Narrativa do onboarding

- Status: Proposto
- Data: 2026-11-19

## Contexto

O onboarding precisa ouvir o que a pessoa conta sobre si, sobre como se relaciona e sobre o que busca. São três capítulos com quatro perguntas cada. Ainda não existem rotas de narrativa no back-end: o contrato abaixo é uma proposta, a confirmar com os responsáveis, conforme o [ADR 0008](0008-integracao-com-o-back-end.md).

O design também prevê a opção "Falar", mas microfone está fora do MVP pelo [ADR 0006](0006-permissoes.md).

## Decisão

**Perguntas e fluxo**

- `src/features/onboarding/story/chapters.ts` é a fonte única dos capítulos e perguntas, com identificadores estáveis em `snake_case`. Incluir ou reordenar perguntas exige mudar só essa lista. Depois, as perguntas poderão vir da API sem mudar as telas.
- Uma única rota renderiza todas as perguntas. O capítulo, a pergunta atual e o texto em edição ficam em estado local: só a pergunta muda, sem navegar a cada resposta nem remontar a tela.
- As respostas são salvas por capítulo, ao terminar ou pular o capítulo, nunca a cada tecla. Pular mantém as respostas já escritas; um texto vazio enviado explicitamente apaga aquela resposta.
- O texto é aparado com `trim()` e limitado a `STORY_ANSWER_MAX_LENGTH` (2000 caracteres) antes do envio.
- A aba "Falar" mostra um aviso de que o recurso ainda não está disponível e não pede permissão de microfone. Responder por texto continua disponível.

**Contrato proposto (não publicado pelo back-end)**

Toda chamada usa `src/lib/api/client.ts`, com autenticação de sessão. O app não chama IA diretamente.

```ts
type StoryAnswer = { question_id: StoryQuestionId; text: string };
type Story = { answers: StoryAnswer[]; completed_at: string | null };
type StoryResponse = { story: Story };
```

`StoryQuestionId` é derivado da lista de perguntas em `chapters.ts`. `completed_at` é uma data ISO 8601 quando concluído, ou `null` antes da conclusão.

| Método | Rota                         | Corpo         | Resposta de sucesso |
| ------ | ---------------------------- | ------------- | ------------------- |
| GET    | `/v1/profile/story`          | —             | `{ story: Story }`  |
| PUT    | `/v1/profile/story/answers`  | `{ answers }` | `{ story: Story }`  |
| POST   | `/v1/profile/story/complete` | —             | `{ story: Story }`  |

- O PUT é um upsert parcial: só os `question_id` enviados mudam. Texto vazio depois de `trim()` apaga a resposta; perguntas ausentes do envio permanecem como estavam.
- Erro esperado de validação: 422 com `message` e `errors` por campo, por exemplo `{ "message": "Confira as respostas.", "errors": { "answers.0.text": ["Use no máximo 2000 caracteres."] } }`.
- Erro esperado de autenticação: 401, tratado pelo cliente de API com as regras de renovação e expiração de sessão do ADR 0008.
- As respostas são tipadas com `api<StoryResponse>`, seguindo `auth-service.ts`, sem uma camada adicional de validação de payload nesta proposta.

**Chave de ativação e cache**

- `STORY_API_ENABLED` começa em `false` e só será ligado depois que o back-end publicar as rotas e o contrato for confirmado. Com `false`, nenhuma dessas operações faz chamada de rede.
- Na simulação, `fetchStory` resolve `{ answers: [], completed_at: null }`; `saveStoryAnswers` devolve as respostas enviadas, aparadas e limitadas, sem as vazias, e `completed_at: null`; `completeStory` devolve respostas vazias e `completed_at: new Date().toISOString()`.
- Os hooks usam TanStack Query com chave `['profile', 'story']` e `staleTime: Infinity`, pois só este dispositivo edita. Respostas recebidas são mescladas no cache por `question_id`: o servidor prevalece nos identificadores que devolve. Exclusões explícitas também saem do cache, e concluir preserva as respostas já guardadas.

## Consequências

- As telas podem usar as mesmas funções durante a simulação e após a ativação da API.
- Com a API desligada, as respostas ficam apenas no cache em memória; não há persistência entre execuções nem envio para análise.
- A API precisará garantir o upsert parcial e a validação das respostas. A equipe de back-end ainda precisa concordar com rotas, formatos e erros antes da ativação.
- Voz fica adiada. Usar microfone no futuro exige rever o ADR 0006 antes de implementar captura ou solicitar permissão.
