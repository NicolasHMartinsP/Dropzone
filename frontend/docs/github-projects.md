# GitHub Projects — desenvolvimento

O repositório de destino ainda não foi identificado. Nenhum quadro ou Issue foi criado externamente. O backlog está em `backlog.json` e o formulário de novas tarefas em `.github/ISSUE_TEMPLATE/tarefa.yml`.

## Criar e vincular o quadro

1. Abra o repositório correto no GitHub e acesse **Projects**.
2. Crie um projeto, escolhendo o layout **Board**. Caso o fluxo crie o projeto na conta primeiro, vincule-o ao repositório em seguida.
3. Use o nome **DropZone — Desenvolvimento**.
4. Edite o campo **Status** para conter, nesta ordem, exatamente as opções abaixo.
5. Configure a visão Board para usar **Status** como campo das colunas e salve a visão.
6. Mostre os campos de responsável e rótulos nos cartões.

| Coluna       | Significado                                  | Quando mover para ela                          |
| ------------ | -------------------------------------------- | ---------------------------------------------- |
| A fazer      | Trabalho planejado que não começou           | Tarefa descrita e critérios definidos          |
| Em andamento | Implementação ativa                          | Responsável assumiu a atividade                |
| Testes       | Implementação pronta, aguardando verificação | Código e documentação disponíveis para revisão |
| Concluído    | Critérios atendidos e validação realizada    | Evidência de teste registrada na Issue         |

## Registrar tarefas

Para cada entrada do backlog, crie uma Issue com título, descrição e lista de critérios. Defina o responsável no campo **Assignees**; esse nome não foi presumido neste projeto. Adicione a Issue ao Project e defina seu Status.

Modelo:

```markdown
## Objetivo

Implementar a navegação entre as quatro telas do sistema.

## Responsável

Definido no campo Assignees desta Issue.

## Critérios de aceite

- [ ] A landing, downloads, conversor e histórico têm rotas próprias.
- [ ] Os links internos usam React Router DOM.
- [ ] A rota ativa aparece no menu.
- [ ] O menu funciona em desktop e celular.

## Evidência de validação

Descrever o cenário e o resultado observado; anexar evidência quando útil.
```

Não invente uma cronologia de trabalho: o backlog informa o estado atual conhecido. Itens com verificação manual pendente permanecem em **Testes**, mesmo quando os testes de API passaram. Tarefas opcionais futuras só devem entrar no quadro se forem aprovadas como escopo.

Consulte a [documentação oficial do quadro](https://docs.github.com/pt/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-board-layout) para os nomes atuais dos controles da interface.
