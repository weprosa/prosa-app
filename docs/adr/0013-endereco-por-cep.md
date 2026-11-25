# 0013. Endereço pelo CEP com ViaCEP

- Status: Aceito para o app; contrato da API proposto
- Data: 2026-11-24

## Contexto

O cadastro passa a pedir CEP, logradouro, cidade e estado. Digitar tudo à mão é cansativo e gera erro, então o CEP preenche os demais campos pelo ViaCEP, um serviço público de consulta de endereços.

O back-end ainda não tem campos de endereço no perfil. O contrato abaixo é uma proposta, a confirmar com os responsáveis, conforme o [ADR 0008](0008-integracao-com-o-back-end.md).

## Decisão

**Consulta do CEP**

- O app consulta o ViaCEP diretamente, em `src/lib/viacep.ts`. O serviço é público e não usa chave nem token, então nenhum segredo entra no app.
- A consulta só dispara pelo botão ao lado do campo CEP ou pela tecla de envio do teclado nesse campo. Nunca roda a cada tecla.
- Todos os campos continuam editáveis: o que o ViaCEP devolve é uma sugestão, e a pessoa pode corrigir ou preencher à mão.
- O estado é escolhido de uma lista fechada com as 27 UFs, nunca digitado.
- O botão ao lado do campo é a prop `action` do `TextField`, documentada em `DESIGN.md`.

**Contrato proposto (não publicado pelo back-end)**

Três campos novos no perfil, enviados em `PUT /v1/me/onboarding/profile` e devolvidos em `GET /v1/me/onboarding`:

| Campo         | Formato                            |
| ------------- | ---------------------------------- |
| `postal_code` | 8 dígitos, sem hífen               |
| `street`      | texto, até 150 caracteres          |
| `state`       | UF de 2 letras (por exemplo, `SP`) |

- `city` já existe no contrato confirmado e continua igual.
- A chave `ADDRESS_API_ENABLED` fica em `false` em `src/features/onboarding/onboarding-service.ts` e só será ligada depois que o back-end publicar os campos.
- Com a chave desligada, só `city` é enviada. CEP, logradouro e estado ficam como rascunho no cache em memória (`use-onboarding.ts`): sobrevivem a ir e voltar entre as etapas na mesma sessão, mas se perdem ao fechar o app ou entrar em outro aparelho, e a pessoa precisa preenchê-los de novo.

**Privacidade**

Segue a regra 4 do [PRODUCT.md](../../PRODUCT.md) e o [ADR 0006](0006-permissoes.md).

- O CEP digitado vai a um terceiro, o ViaCEP, que recebe o CEP e o IP da pessoa. A consulta só acontece por ação explícita.
- Pedimos o logradouro sem número, para não identificar a casa da pessoa.
- O endereço nunca aparece para outras pessoas.
- A precisão usada no match continua a das coordenadas arredondadas a duas casas decimais: o endereço não a aumenta.

## Consequências

- ViaCEP fora do ar, sem rede ou CEP inexistente não bloqueia o cadastro: a pessoa preenche logradouro, cidade e estado à mão.
- Com `ADDRESS_API_ENABLED = false`, o endereço completo não é guardado entre sessões nem enviado. Só `city` chega ao back-end.
- Pendências a confirmar com o back-end: nomes, limites e obrigatoriedade de `postal_code`, `street` e `state`, a validação da UF e do CEP no servidor e o formato dos erros 422.
- Revisar este ADR quando o contrato existir, e ligar a chave só então.
- O app passa a depender de um serviço de terceiros na etapa de endereço. Se isso se tornar um problema, a consulta pode migrar para o back-end sem mudar as telas.
