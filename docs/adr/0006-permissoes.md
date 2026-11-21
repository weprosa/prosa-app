# 0006. Permissões: localização em uso e câmera

- Status: Aceito, microfone revisto pelo ADR 0012
- Data: 2026-11-09

O [ADR 0012](0012-ditado-por-voz.md) permite microfone e reconhecimento de fala apenas para ditado na narrativa, revendo os trechos abaixo sobre microfone.

## Contexto

O app deve precisar de localização (encontrar pessoas por perto) e de câmera e fotos (perfil e conversa). Permissão pedida cedo ou sem explicação é negada, e uma negada no iOS não pode ser pedida de novo. As lojas também rejeitam apps que declaram permissão sem uso claro.

## Decisão

- **Localização só com o app em uso** (`expo-location`, permissão foreground). Localização em segundo plano está bloqueada na configuração.
- **Câmera e biblioteca de fotos** via `expo-image-picker`. Microfone desativado.
- Os textos de permissão ficam em `app.config.ts`, em português, dizendo para que o dado serve.
- **Pedir no momento do uso**, depois de a tela explicar o motivo. Nunca na abertura do app nem em sequência.
- Todo pedido passa por `src/lib/permissions.ts`, que devolve `granted`, `denied` ou `blocked`. Em `blocked`, a tela explica e oferece abrir os Ajustes.
- O app precisa continuar utilizável com qualquer permissão negada, com um caminho alternativo (informar a cidade à mão, por exemplo).
- Fora do MVP: localização em segundo plano, microfone, contatos, notificações push e rastreamento (ATT).

## Consequências

- Precisar de câmera dentro do app (preview ao vivo, vídeo) exige `expo-camera` e um ADR novo.
- A localização enviada ao back-end deve ter só a precisão necessária para o match; a precisão exata é assunto para o ADR do contrato da API.
- Notificações push vão precisar de ADR próprio quando o chat chegar.
