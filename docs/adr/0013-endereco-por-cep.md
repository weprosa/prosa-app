# 0013. Endereço pelo CEP com ViaCEP

- Status: Aceito; contrato confirmado pela API (prosa-api main 235b623, 2026-11-26)
- Data: 2026-11-24
- Revisão: 2026-11-26

## Contexto

O cadastro passa a pedir CEP, logradouro, bairro (opcional), cidade e estado. Digitar tudo à mão é cansativo e gera erro, então o CEP preenche os demais campos pelo ViaCEP, um serviço público de consulta de endereços.

O back-end já aceita e salva os campos de endereço no perfil. O contrato foi confirmado no código e na OpenAPI do prosa-api (main 235b623), conforme o [ADR 0008](0008-integracao-com-o-back-end.md).

## Decisão

**Consulta do CEP**

- O app consulta o ViaCEP diretamente, em `src/lib/viacep.ts`. O serviço é público e não usa chave nem token, então nenhum segredo entra no app.
- A consulta só dispara pelo botão ao lado do campo CEP ou pela tecla de envio do teclado nesse campo. Nunca roda a cada tecla.
- Todos os campos continuam editáveis: o que o ViaCEP devolve é uma sugestão, e a pessoa pode corrigir ou preencher à mão.
- A etapa 1 inclui o campo Bairro (opcional), preenchido pelo ViaCEP quando houver essa informação.
- O estado é escolhido de uma lista fechada com as 27 UFs, nunca digitado.
- O botão ao lado do campo é a prop `action` do `TextField`, documentada em `DESIGN.md`.

**Contrato da API**

Campos enviados em `PUT /v1/me/onboarding/profile` e devolvidos nas respostas dos PUTs e em `GET /v1/me/onboarding`:

| Campo          | Regra no back-end                             | O que o app envia                                      |
| -------------- | --------------------------------------------- | ------------------------------------------------------ |
| `postal_code`  | Opcional ou `null`; texto, até 20 caracteres  | 8 dígitos, sem hífen                                   |
| `street`       | Opcional ou `null`; texto, até 255 caracteres | Logradouro sem número, até 150 caracteres              |
| `neighborhood` | Opcional ou `null`; texto, até 100 caracteres | Bairro opcional, até 100 caracteres; vazio vira `null` |
| `city`         | Opcional ou `null`; texto, até 100 caracteres | Cidade obrigatória no app, até 100 caracteres          |
| `state`        | Opcional ou `null`; texto, até 100 caracteres | UF de 2 letras (por exemplo, `SP`)                     |

- Os cinco campos estão sempre presentes nas respostas, como texto ou `null`.
- A chave `ADDRESS_API_ENABLED` e o rascunho de endereço em memória foram removidos. O endereço agora é enviado e salvo no back-end.
- Se `latitude` e `longitude` não forem enviadas, o back-end grava ambas como `null`, mesmo que houvesse coordenadas anteriores.

**Privacidade**

Segue a regra 4 do [PRODUCT.md](../../PRODUCT.md) e o [ADR 0006](0006-permissoes.md).

- O CEP digitado vai a um terceiro, o ViaCEP, que recebe o CEP e o IP da pessoa. A consulta só acontece por ação explícita.
- Pedimos o logradouro sem número, para não identificar a casa da pessoa.
- O endereço, incluindo o bairro, nunca aparece para outras pessoas.
- A precisão usada no match continua a das coordenadas arredondadas a duas casas decimais: o endereço não a aumenta.

## Consequências

- ViaCEP fora do ar, sem rede ou CEP inexistente não bloqueia o cadastro: a pessoa preenche logradouro, cidade e estado à mão.
- A API aceita `state` como texto livre de até 100 caracteres e `postal_code` como texto livre de até 20. A validação da UF e dos 8 dígitos do CEP é feita só pelo app.
- O app passa a depender de um serviço de terceiros na etapa de endereço. Se isso se tornar um problema, a consulta pode migrar para o back-end sem mudar as telas.
