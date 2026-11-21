# 0012. Ditado por voz na narrativa

- Status: Aceito
- Data: 2026-11-19

## Contexto

A narrativa do onboarding permite que você conte sobre si com suas próprias palavras. O ditado reduz o esforço de escrever respostas longas no celular e precisa preservar a opção de escrever. O [ADR 0006](0006-permissoes.md) deixava microfone fora do MVP; esta decisão permite seu uso exclusivamente para ditado e substitui o adiamento da voz descrito no [ADR 0011](0011-narrativa-do-onboarding.md).

Foram comparadas as alternativas:

- **`expo-speech-recognition`** integra os serviços de reconhecimento de fala do iOS e do Android, tem plugin de configuração para Expo SDK 58, resultados parciais, eventos de volume e módulo web para o preview. Não exige modelo distribuído pelo app nem chave de API.
- **`@react-native-voice/voice`** foi arquivado em janeiro de 2026; não é uma base adequada para uma integração nova.
- **`whisper.rn` e `react-native-executorch`** exigem modelos de aproximadamente 75–466 MB e têm custo de inicialização a frio. Esse peso não se justifica para o ditado do MVP.
- **Módulo próprio com SpeechAnalyzer** exigiria manutenção nativa e uma solução separada para Android, sem benefício que justifique esse investimento agora.
- **`react-native-nitro-speech`** é promissor, mas está menos comprovado no Expo SDK 58.

## Decisão

- Usar **`expo-speech-recognition`**, atrás do contrato de `src/lib/voice-dictation-types.ts`. A tela recebe disponibilidade, estado, erro, instante de início, nível de áudio e ações de iniciar, parar e cancelar. O texto completo é entregue a cada mudança e uma única vez ao encerrar.
- O reconhecimento usa **o serviço de fala do sistema operacional (Apple/Google)** e pode processar áudio nos servidores desse serviço. O app não envia áudio ao Prosa, não guarda gravação e não usa chave de API. Isso não viola a regra de que o app nunca fala diretamente com um modelo de IA: trata-se do ditado do sistema operacional, como o microfone do teclado, sem integração direta com um provedor de modelos. Análise de perfil e match continuam passando exclusivamente pelo back-end.
- Priorizar velocidade e disponibilidade: idioma `pt-BR`, resultados parciais, escuta contínua, pontuação, uma alternativa e tarefa iOS `dictation`. `requiresOnDeviceRecognition: false` deixa o serviço do sistema decidir entre processamento local e remoto; não há garantia de funcionamento offline. Solicitar eventos de volume a cada 100 ms e não persistir áudio.
- **Toque para começar, toque para parar.** Pedir permissão somente depois do toque no microfone, via `ensureSpeechPermission()` em `src/lib/permissions.ts`. No iOS são pedidos microfone e reconhecimento de fala; no Android, apenas microfone. As justificativas ficam em português em `app.config.ts`.
- **Escrever continua disponível**, inclusive com permissão negada, serviço indisponível ou erro. Negação definitiva oferece o caminho dos Ajustes na interface. Erros mantêm o último texto entregue.
- Acrescentar o ditado ao texto inicial, preservar segmentos finalizados e substituir apenas a hipótese parcial. Respeitar o limite do campo sem cortar pares substitutos Unicode. Parar ao atingir o limite, após 10 segundos sem resultado inicial ou 8 segundos sem novo resultado.
- Ao parar, esperar o resultado final por até 2500 ms; depois manter o último parcial. Cancelar invalida a sessão e não entrega mais texto. Uma nova escuta aguarda o encerramento nativo anterior para não misturar respostas.
- Usar `expo-haptics` para retorno leve ao começar e encerrar a escuta. Atualizar o nível de áudio em shared value, sem renderização React a cada evento.

## Consequências

- É necessário **um novo development build** para incluir o módulo, as permissões e a visibilidade dos serviços Android. Expo Go não basta. As pastas `ios/` e `android/` continuam geradas por CNG, sem edição manual.
- O `SFSpeechRecognizer` do iOS limita sessões a aproximadamente um minuto; o encerramento do serviço preserva o texto e permite iniciar outro ditado.
- No Android, o resultado final após parar pode não chegar. O último parcial é mantido após o tempo limite. Escuta contínua e pontuação também dependem da versão do Android e do serviço instalado.
- **Português do Brasil offline não é garantido.** Disponibilidade, conexão e restrições do aparelho podem impedir o reconhecimento. A pessoa sempre pode escrever a resposta.
- O processamento remoto pelo serviço do sistema deve ser considerado na comunicação de privacidade; não há gravação de áudio armazenada pelo Prosa.
- `expo-image-picker` recebe a mesma justificativa de microfone: definir `microphonePermission: false` bloquearia `RECORD_AUDIO` no Android e removeria a justificativa do iOS, impedindo o ditado.
- A integração precisa ser validada em aparelhos iOS e Android com permissões negadas, interrupções e diferentes serviços de fala antes da distribuição.
