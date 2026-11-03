# Documentação das telas

Atualizado em 03/11/2026. “Concluída” indica implementação existente; a cobertura e as limitações de validação estão em `testes.md`.

| Tela           | Arquivo                               | Rota         | Funcionalidade                                                                     | Situação                                                                               |
| -------------- | ------------------------------------- | ------------ | ---------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------- |
| Landing / home | `pages/LandingPage/LandingPage.jsx`   | `/`          | Apresentação, atalhos, formatos, etapas e dúvidas frequentes                       | Concluída                                                                              |
| Downloads      | `pages/DownloadPage/DownloadPage.jsx` | `/downloads` | Link → análise real → formatos disponíveis → resultado → salvar                    | Concluída; transporte externo e integração no navegador pendentes de verificação local |
| Conversor      | `pages/ConvertPage/ConvertPage.jsx`   | `/conversor` | Upload por seleção/arraste, prévia de imagem, formato, processamento e resultado   | Concluída; API testada e verificação do fluxo completo no navegador pendente           |
| Histórico      | `pages/HistoryPage/HistoryPage.jsx`   | `/historico` | Busca, filtros por operação/situação, paginação, estatísticas, download e exclusão | Concluída; API testada e integração no navegador pendente                              |
| Não encontrada | `pages/NotFoundPage/NotFoundPage.jsx` | `*`          | Recuperar a navegação de uma rota inexistente                                      | Concluída                                                                              |

## Estados que cada tela precisa manter

**Downloads:** vazio, analisando, fonte disponível, preparando, concluído e erro. Alterar o link descarta a análise da interface; a fonte anterior expira no servidor. Uma fonte é consumida ao preparar o download. Em caso de falha nessa etapa, analise o link novamente.

**Conversor:** vazio, arquivo selecionado, convertendo, concluído e erro. Um arquivo por vez. A interface faz uma validação inicial de tipo e tamanho; o backend verifica o conteúdo real. A prévia usa uma URL de objeto, revogada ao trocar ou remover o arquivo.

**Histórico:** carregando, lista preenchida, vazio, filtros sem resultados, falha de conexão e confirmação de exclusão. Operações concluídas podem ter arquivos expirados; isso não apaga o registro. O filtro modifica a lista, enquanto as estatísticas mostram o total do histórico.

**Global:** conexão verificando/conectada/desconectada, navegação desktop/mobile e avisos de sucesso/erro. As quatro telas compartilham Header e Footer por meio de Layout.

## Regras de navegação

As rotas ficam em `src/App.jsx`. `BrowserRouter` é inicializado em `src/main.jsx`. Use `Link`, `NavLink` ou o componente `Button` com `to` para caminhos internos. Links para Swagger abrem uma nova aba. A posição da página é reiniciada ao mudar a rota.

Não há proteção por login. A landing é sempre a rota inicial; não foi implementada uma home diferente por sessão.
