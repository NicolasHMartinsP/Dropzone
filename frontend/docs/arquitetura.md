# Arquitetura e fluxo dos dados

## Prioridades aprovadas (2026-11-03)

1. Persistência com **PostgreSQL + Sequelize**, requisito obrigatório da faculdade (#12).
2. Baixar **MP4/MP3 por links compartilhados** de fontes públicas suportadas, além dos links diretos (#4).
3. Validar conversões de imagens PNG/JPG/WebP, áudio MP3/WAV/OGG, vídeo MP4/WebM e extração MP4 → MP3 (#14).
4. Simplificar a interface: #171219, #355834 e #D33F49, texto neutro legível, grão discreto, espaçamento consistente e animações curtas (#15).
5. Conta e histórico privado de metadados ficam depois das ferramentas públicas (#13, #16 e #17).

**Situação real:** o código usa PostgreSQL + Sequelize, aceita links diretos e converte no backend local com Sharp/FFmpeg. Links compartilhados são trabalho pendente.
Para entregar áudio/vídeo sem duplicar motores, o backend existente será reaproveitado. Conversão no navegador fica como melhoria posterior.
O adaptador de compartilhamento deve avaliar yt-dlp; suporte por fonte precisa ser testado e datado, sem promessa de compatibilidade universal.
PDF/Office, playlists/lotes e login em plataformas não fazem parte desta primeira entrega.

O [Project](https://github.com/users/NicolasHMartinsP/projects/1) é a fonte oficial de tarefas e status.

## Implementação atual

Os fluxos abaixo descrevem o código existente. Atualizá-los junto com cada implementação.

O projeto tem duas aplicações independentes. O frontend conhece a API por HTTP. O backend conhece arquivos temporários, ferramentas de conversão e banco PostgreSQL. O navegador não acessa Sequelize diretamente.

## Exemplo: converter PNG para WebP

1. `ConvertPage` recebe um `File`, verifica tipo/tamanho inicialmente e guarda a escolha do formato.
2. `conversionService.convert` cria `FormData` e usa o cliente HTTP em `services/api.js`.
3. O Vite encaminha `/api/conversions` para a API durante o desenvolvimento.
4. `api.routes.js` aplica limite de solicitações e o Multer recebe o arquivo no disco.
5. `conversion.controller.js` verifica os campos da requisição e chama o service.
6. `job.service.js` identifica o conteúdo, cria um Job em processamento e coordena o resultado.
7. `conversion.service.js` transforma os bytes com Sharp ou FFmpeg.
8. O Job é atualizado pelo Sequelize no PostgreSQL. O arquivo de entrada é removido em `finally`.
9. A API retorna metadados públicos e `downloadUrl`, sem expor caminhos do servidor.
10. `TaskResult` apresenta a conclusão. Ao clicar em salvar, `saveFile` recebe o binário e solicita o download ao navegador.

## MVC neste projeto

| Camada     | Local                     | Regra                                                         |
| ---------- | ------------------------- | ------------------------------------------------------------- |
| Model      | `backend/src/models`      | Define estrutura, validação do modelo e persistência pelo ORM |
| View       | Aplicação React separada  | Apresenta os dados e captura ações                            |
| Controller | `backend/src/controllers` | Traduz requisições e respostas HTTP                           |
| Services   | `backend/src/services`    | Concentra regras e coordenação                                |
| Routes     | `backend/src/routes`      | Mapeia endpoints e middlewares                                |

O termo “MCP” do requisito foi mantido como ponto a confirmar: aqui a arquitetura é MVC; não existe integração Model Context Protocol.

## Services do backend

| Arquivo                 | Responsabilidade                                                      |
| ----------------------- | --------------------------------------------------------------------- |
| `conversion.service.js` | Descobrir capacidades, identificar conteúdo e executar Sharp/FFmpeg   |
| `remote.service.js`     | Validar URL/DNS/redirecionamentos e receber mídia com limite de bytes |
| `job.service.js`        | Coordenar jobs, fontes temporárias, resultados e retenção             |
| `history.service.js`    | Consultar, filtrar, paginar e excluir registros/resultados            |

Não há fila distribuída. As operações aguardam o processamento na própria requisição HTTP. O limite em memória permite dois processamentos simultâneos. Fontes analisadas também ficam indexadas em memória e são perdidas em uma reinicialização; o histórico no PostgreSQL e os resultados concluídos permanecem no disco.

## Modelo Job

| Campo                                     | Finalidade                                                             |
| ----------------------------------------- | ---------------------------------------------------------------------- |
| `id`                                      | UUID da operação                                                       |
| `kind`                                    | `download` ou `conversion`                                             |
| `status`                                  | `processing`, `completed` ou `failed`                                  |
| `inputName`, `outputName`                 | Nomes apresentados ao usuário                                          |
| `inputFormat`, `outputFormat`, `mimeType` | Identificação dos formatos                                             |
| `sizeBytes`                               | Tamanho do resultado; não representa tráfego total                     |
| `sourceUrl`                               | Origem de um download; não é devolvida na listagem                     |
| `filePath`                                | Caminho interno, omitido nas respostas públicas                        |
| `errorMessage`                            | Motivo legível de uma falha de processamento                           |
| `favorite`                                | Marca o registro como favorito; favoritos não expiram (padrão `false`) |
| `createdAt`, `updatedAt`, `completedAt`   | Datas da operação                                                      |
| `expiresAt`                               | Prazo para salvar o resultado                                          |

Erros de validação que acontecem antes de criar um Job não aparecem no histórico. Falhas após criar o registro recebem situação `failed`. Na inicialização, jobs interrompidos são marcados como falhos, entradas antigas são removidas e saídas órfãs são limpas.

## Decisões de escopo

PostgreSQL é utilizado com Sequelize e migrações versionadas que deixam mudanças explícitas.

O backend usa somente caminhos gerados por UUID, valida conteúdo e tamanho, bloqueia IPs não públicos, fixa o IP validado na conexão e revalida redirecionamentos. FFmpeg recebe argumentos sem shell e apenas contêineres de mídia são aceitos; playlists são rejeitadas. Isso não transforma o MVP em um serviço público pronto para internet. Autenticação, isolamento por usuário, filas, isolamento do processo de mídia e armazenamento externo exigem uma evolução específica.
