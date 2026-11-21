# Decisões de arquitetura (ADRs)

Cada arquivo registra uma decisão: o contexto, o que foi decidido e o que isso custa. ADRs são os limites do projeto. Código que contraria um ADR aceito está errado, ou o ADR precisa ser substituído por outro.

| Nº                                         | Decisão                                       | Status   |
| ------------------------------------------ | --------------------------------------------- | -------- |
| [0001](0001-registrar-decisoes-em-adrs.md) | Registrar decisões em ADRs                    | Aceito   |
| [0002](0002-expo-e-react-native.md)        | Expo, React Native e Expo Router              | Aceito   |
| [0003](0003-estrutura-e-fronteiras.md)     | Estrutura de pastas e fronteiras              | Aceito   |
| [0004](0004-design-system.md)              | Design system próprio com tokens e StyleSheet | Aceito   |
| [0005](0005-tipografia-e-tema.md)          | Playfair Display + Inter, só tema claro       | Aceito   |
| [0006](0006-permissoes.md)                 | Permissões: localização em uso e câmera       | Aceito   |
| [0007](0007-performance.md)                | Regras de performance                         | Aceito   |
| [0008](0008-integracao-com-o-back-end.md)  | Integração com o back-end Laravel             | Proposto |
| [0009](0009-idioma.md)                     | Código em inglês, interface em português      | Aceito   |
| [0010](0010-login-com-google.md)           | Login com Google                              | Aceito   |
| [0011](0011-narrativa-do-onboarding.md)    | Narrativa do onboarding                       | Proposto |

## Como criar um ADR

1. Copie o modelo abaixo para `NNNN-titulo-curto.md`, com o próximo número.
2. Status começa em `Proposto` e vira `Aceito` quando a equipe concordar.
3. Não reescreva um ADR aceito. Para mudar a decisão, crie outro e marque o antigo como `Substituído por NNNN`.
4. Atualize a tabela acima.

```markdown
# NNNN. Título

- Status: Proposto | Aceito | Substituído por NNNN
- Data: AAAA-MM-DD

## Contexto

## Decisão

## Consequências
```
