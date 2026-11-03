# GitHub Projects — desenvolvimento

Quadro: **DropZone | Desenvolvimento** — https://github.com/users/NicolasHMartinsP/projects/1

Repositório vinculado: [NicolasHMartinsP/Dropzone](https://github.com/NicolasHMartinsP/Dropzone). O backlog resumido também está em [backlog.json](backlog.json).

## Colunas (campo Status)

| Coluna       | Significado                                  | Quando mover para ela                        |
| ------------ | -------------------------------------------- | -------------------------------------------- |
| A fazer      | Trabalho planejado que não começou           | Tarefa descrita e critérios definidos        |
| Em andamento | Implementação ativa                          | Branch criada a partir de `develop`          |
| Testes       | Implementação pronta, aguardando verificação | PR aberto para `develop` e testes executados |
| Concluído    | Critérios atendidos e validação realizada    | Evidência registrada na Issue e PR integrado |

Enviar código ao GitHub **não** conclui uma tarefa. A Issue só vai para **Concluído** depois de conferir cada critério de aceite.

## Campos

| Campo       | Opções                                                                                   |
| ----------- | ---------------------------------------------------------------------------------------- |
| Prioridade  | Alta, Média, Baixa                                                                       |
| Área        | Frontend, Backend, Banco de dados, Segurança, Testes, Documentação (área principal)      |
| Entrega     | Base existente, Downloads, Conversor local, Histórico opcional, Qualidade e documentação |
| Responsável | Campo nativo **Assignees**                                                               |

## Ordem de desenvolvimento

**Entrega 1 — Ferramentas públicas:** DZ-04 (#4) downloads por URL → DZ-13 (#14) conversão local → DZ-14 (#15) interface do conversor → DZ-03 (#3) navegação e responsividade.

**Entrega 2 — Histórico opcional:** DZ-12 (#13) modelagem → DZ-15 (#16) autenticação → DZ-16 (#17) histórico sincronizado.

**Entrega 3 — Consolidação:** DZ-17 (#18) testes e documentação → DZ-11 (#11) roteiro da apresentação.

O login nunca bloqueia as ferramentas públicas: a Entrega 1 não depende da Entrega 2.

## Fluxo de trabalho

1. Escolher **uma** Issue em **A fazer**, seguindo a ordem acima.
2. Movê-la para **Em andamento** e atribuí-la em Assignees.
3. Criar a branch a partir de `develop`: `feat/<assunto>` para funcionalidades, `fix/<assunto>` para correções.
4. Implementar, executar os testes e atualizar a documentação relevante.
5. Abrir Pull Request para `develop` citando a Issue (`Refs #N`).
6. Revisar o código e mover a Issue para **Testes**.
7. Validar os critérios de aceite e registrar a evidência na Issue.
8. Mover para **Concluído** e fechar a Issue.
9. Integrar `develop` à `main` quando uma entrega estiver estável.

## Novas tarefas

Use o formulário `.github/ISSUE_TEMPLATE/tarefa.yml` e substitua o título por `[DZ-NN] Verbo + objeto`. Crie Issues apenas para trabalho dentro do escopo aprovado (ver [requisitos.md](requisitos.md)).
