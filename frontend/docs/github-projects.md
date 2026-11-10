# GitHub Projects — desenvolvimento

Quadro: https://github.com/users/NicolasHMartinsP/projects/1
Repositório: https://github.com/NicolasHMartinsP/Dropzone
Responsável inicial: @NicolasHMartinsP. As Issues e o Project são a fonte oficial do backlog.

| Status | Significado |
| --- | --- |
| A fazer | Planejado, sem implementação iniciada |
| Em andamento | Implementação ativa |
| Testes | Implementado, aguardando validação |
| Concluído | Critérios atendidos e evidência registrada |

## Ordem de implementação

1. #12: migrar para PostgreSQL.
2. #4: MP4/MP3 por link compartilhado de fontes suportadas.
3. #14: validar as conversões principais com Sharp/FFmpeg.
4. #15 e #3: interface minimalista e validação de navegação/responsividade.
5. #18 e #11: testes, documentação e apresentação.
6. #13 → #16 → #17: modelagem, autenticação e histórico opcionais, após as ferramentas públicas.

Prioridade Alta: banco, downloads, conversor, interface e qualidade. Média: conta/histórico e apresentação.
Campos: Prioridade, Área e Entrega; responsável em Assignees.
A #12 foi reaberta porque PostgreSQL é requisito da faculdade; o encerramento anterior como não planejado deixou de valer.
As #5 e #6 permanecem arquivadas como tarefas substituídas; consultar #14 e #17.

A develop recebeu a main por fast-forward em 2026-11-03. Criar feat/* ou fix/* a partir de develop e abrir PR para develop; promover à main após validar.
Atualização de planejamento não comprova implementação. Não mover uma funcionalidade para Concluído usando resultados da versão antiga.
backlog.json é somente um registro histórico da preparação inicial, sem sincronização com o quadro.
