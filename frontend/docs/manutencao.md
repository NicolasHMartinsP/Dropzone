# Guia de manutenção

## Antes de alterar

Leia o fluxo de uma funcionalidade de ponta a ponta. Execute o backend e o frontend. Verifique `GET /api/health` e confirme se a funcionalidade exige FFmpeg. Use arquivos pequenos para testar.

## Nova tela

1. Crie `src/pages/NomePage/NomePage.jsx` e `NomePage.module.css`.
2. Use componentes existentes quando as responsabilidades coincidirem.
3. Cadastre uma rota em `src/App.jsx`.
4. Se necessário, adicione um `NavLink` no Header.
5. Documente a tela em `docs/telas.md` e registre a tarefa no quadro.

## Novo componente

Crie JSX e CSS Module na mesma pasta. Receba dados por props e devolva ações por callbacks. Componentes de apresentação, como `FormatPicker`, não devem decidir regras de banco nem executar requisições. O componente `TaskResult` é um componente de fluxo: usa o service comum para salvar o resultado.

Evite nomes como `data2`, `handleThing` ou `doStuff`. Prefira `source`, `prepareDownload`, `selectFile` e `confirmDelete`. Uma função deve representar uma operação compreensível. Não transforme toda condição curta em um hook ou service novo.

## Novo endpoint

1. Defina entrada, saída, erros e critérios de aceite.
2. Cadastre a rota e os middlewares em `backend/src/routes/api.routes.js`.
3. Crie/ajuste o controller para lidar com HTTP.
4. Implemente a regra em um service. Use `AppError` para erros esperados.
5. Atualize `backend/src/docs/openapi.js`.
6. Adicione um teste de comportamento relevante e execute `npm test`.
7. No frontend, exponha a chamada por `src/services`; a página usa esse service.

## Novo formato de conversão

O servidor é a fonte das capacidades. Adicione o formato às listas em `conversion.service.js`, defina o MIME e implemente sua conversão. Para áudio/vídeo, escolha explicitamente os codecs. Não permita argumentos livres de FFmpeg vindos do cliente.

Atualize o enum do Swagger, a detecção inicial de arquivos em `utils/format.js` quando necessário, os textos de ajuda e os testes. Verifique conteúdo, dimensões ou streams do resultado; mudar somente a extensão não é uma conversão.

## Alteração do banco

Crie uma nova migração numerada e registre-a em `database/migrate.js`. Atualize também o modelo `Job`. Não edite a migração inicial depois que ela tiver sido executada em um banco que será mantido. O runner registra migrações concluídas em `SequelizeMeta`.

## CSS e paleta

As cinco cores-base ficam em `styles/global.css`, com nomes `--palette-*`. Tokens `--color-*` indicam o uso de cada cor. Ajustes de layout ficam no CSS Module da tela/componente. Não use seletores globais como `.button` fora do reset para mudar todos os botões.

O verde neon destaca a ação principal, o roxo destaca seleção e o azul marinho sustenta a interface. Preserve contraste, foco visível e estados desabilitados ao alterar as cores.

## Regras práticas de revisão

- Verifique se cada arquivo continua com uma responsabilidade reconhecível.
- Mantenha chamadas HTTP nos services.
- Remova arquivos temporários em sucesso e erro.
- Não apresente uma operação como concluída antes da resposta real.
- Não inclua caminhos locais, stack traces ou segredos nas respostas.
- Execute os testes relevantes e o build após alterar comportamento.
- Atualize a documentação da funcionalidade junto com o código.

## Problemas frequentes

| Sintoma                         | Verificação                                                                                                                   |
| ------------------------------- | ----------------------------------------------------------------------------------------------------------------------------- |
| API desconectada                | Backend aberto no terminal; porta 3333; `VITE_BACKEND_URL` correto                                                            |
| Áudio/vídeo indisponível        | FFmpeg **e** FFprobe no PATH; reinicie o backend                                                                              |
| Link abre uma página            | Use a URL direta do arquivo; links de redes sociais não são suportados                                                        |
| Fonte expirada                  | Analise o link novamente; o token vale 15 minutos e é consumido                                                               |
| Arquivo expirado no histórico   | Repita a operação; os metadados não guardam os bytes indefinidamente                                                          |
| Upload de imagem recusado       | Confira conteúdo real, limite de 50 MB/20 MP e ausência de animação                                                           |
| Porta 5173 ocupada              | Feche a instância anterior ou ajuste Vite e `CLIENT_ORIGIN` juntos                                                            |
| `npm ci` falha em pacote nativo | Confira Node compatível; o driver SQLite pode precisar de ferramentas de compilação se não houver binário para sua plataforma |
