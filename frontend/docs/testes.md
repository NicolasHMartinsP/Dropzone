# Verificação e testes

Data: 03/11/2026. Ambiente verificado: Linux, Node 24.22.1, npm 11.9.0, FFmpeg e FFprobe disponíveis.

## Automação da API

Execute `npm test` na pasta `backend`. A suíte tem 12 cenários, usando PostgreSQL e arquivos temporários. Resultado observado: **12 passaram; nenhum falhou ou foi ignorado** no ambiente acima.

| Cenário                 | O que verifica                                                                      |
| ----------------------- | ----------------------------------------------------------------------------------- |
| Capacidades e Swagger   | Resposta de health, formatos reais, documento OpenAPI válido e UI Swagger           |
| Validação de links      | Protocolos, credenciais, IPs locais/privados, IPv6 e portas não permitidas          |
| DNS                     | Rejeição de resolução mista pública/privada e identificação de IP público           |
| Conversão de imagem     | PNG → WebP/JPG/AVIF/PNG; dimensões, bytes, registro e endpoint de arquivo           |
| Arquivo inválido        | Conteúdo falso, HTML, playlist, SVG, ausência de upload e formato incompatível      |
| Limite de upload        | Resposta 413 e remoção do arquivo parcial                                           |
| Download                | Fonte analisada, resultado original idêntico em bytes, consumo do token e histórico |
| Histórico               | Filtros, busca literal, paginação, validação de parâmetros e estatísticas           |
| Áudio/vídeo             | MP4 de teste com áudio → MP3/WAV/OGG/MP4/WebM; streams inspecionados com FFprobe    |
| Expiração               | Resultado indisponível/removido e metadados mantidos                                |
| Recuperação de reinício | Job interrompido marcado como falho e saída órfã removida                           |
| Exclusão                | Remoção individual, limpeza total e indisponibilidade do resultado excluído         |

O teste de download substitui **somente o transporte externo** por uma função que grava uma imagem conhecida. Identificação, processamento, banco e endpoints restantes são reais. Ele não comprova acesso a um site externo nem ausência de bloqueios do site.

Os testes reiniciam a contagem de rate limit entre cenários para não interferirem entre si. O limite de 20 solicitações/minuto permanece ativo na aplicação. A migração é aplicada duas vezes na preparação para verificar idempotência.

## Frontend

`npm run build` foi executado com sucesso. A landing e o conversor foram inspecionados visualmente em desktop. A navegação para downloads também foi verificada. Seleção de arquivo, prévia, nome, tamanho e formatos do conversor foram exercitados no navegador. O tratamento de API desconectada foi observado.

**Limitação do ambiente de prévia:** o navegador do frontend não alcançou o processo separado do backend. Não considerar validado o fluxo completo de conversão/download/histórico pelo navegador. Os endpoints foram exercitados pelos testes de integração. A responsividade deve ser verificada em navegador mobile ou modo de dispositivo.

## Checklist manual no computador da apresentação

| Ação                                           | Resultado esperado                                                  | Situação                                                 |
| ---------------------------------------------- | ------------------------------------------------------------------- | -------------------------------------------------------- |
| Abrir ambos os servidores                      | Indicador “API conectada”                                           | Pendente local                                           |
| Navegar entre as quatro telas                  | URL e conteúdo corretos, sem recarregar o documento inteiro         | Verificação desktop parcial                              |
| Enviar imagem de exemplo e converter para WebP | Resultado real, nome e tamanho; arquivo pode ser salvo              | API verificada; fluxo visual pendente                    |
| Enviar MP4 com áudio e escolher MP3            | Áudio válido; exige FFmpeg/FFprobe                                  | API verificada; fluxo visual pendente                    |
| Usar link direto de uma mídia pública          | Análise → formatos → resultado → salvar                             | Transporte externo pendente                              |
| Enviar URL de página ou arquivo incompatível   | Mensagem clara, sem falsa conclusão                                 | API verificada                                           |
| Abrir histórico após converter                 | Registro persistido, filtro e busca funcionando                     | API verificada; fluxo visual pendente                    |
| Salvar arquivo pelo histórico                  | Binário real é baixado                                              | API verificada; fluxo visual pendente                    |
| Excluir/cancelar exclusão                      | Diálogo correto; cancelar preserva registro                         | Exclusão da API verificada; diálogo pendente             |
| Reiniciar backend                              | Histórico permanece                                                 | Banco em disco implementado; validar no computador local |
| Abrir em tela de 375 px                        | Menu mobile, sem overflow da página; tabela pode rolar internamente | Pendente                                                 |
| Abrir Swagger e usar Try it out                | JSON real e upload multipart funcionando                            | Especificação validada; interação visual pendente        |

Não marque uma tarefa do quadro como **Concluído** apenas porque o código existe. Use **Testes** até que seus critérios relevantes tenham sido verificados.
