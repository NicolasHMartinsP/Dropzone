# Como contribuir

1. Registre uma Issue com objetivo, responsável e critérios de aceite.
2. Mova a Issue de **A fazer** para **Em andamento** ao iniciar e crie a branch a partir de `develop`: `feat/<assunto>` ou `fix/<assunto>`. Abra o Pull Request para `develop`; `main` recebe apenas entregas estáveis.
3. Mantenha o escopo da alteração pequeno e use nomes que expliquem a intenção.
4. Respeite pages/components/services no frontend e routes/controllers/services/models no backend.
5. Atualize a documentação da funcionalidade junto com o código.
6. Execute os testes relevantes e o build; mova para **Testes** quando estiver pronta para validação.
7. Registre o que foi testado. Use **Concluído** somente quando os critérios de aceite estiverem atendidos.

Não versione banco, arquivos gerados, `.env`, logs nem `node_modules`. As dependências estão fixadas pelos locks; instale com `npm ci`.

Consulte `frontend/docs/manutencao.md` para exemplos de evolução e `frontend/docs/testes.md` para a verificação existente.
