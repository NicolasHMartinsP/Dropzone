# Rastreabilidade dos requisitos

| Requisito                       | Implementação / evidência                                                                 |
| ------------------------------- | ----------------------------------------------------------------------------------------- |
| React e Vite                    | `frontend/package.json`, `src/main.jsx`, `vite.config.js`; build executável               |
| Node                            | `backend/package.json`, `src/server.js`                                                   |
| Front e back separados          | Dois `package.json`, dois locks, dependências e comandos de desenvolvimento independentes |
| Organização MCP                 | Ponto a confirmar; adotado MVC com services, explicado no README e em `arquitetura.md`    |
| Componentes reutilizáveis       | `frontend/src/components`; catálogo em `componentes.md`                                   |
| Telas divididas por setor       | `frontend/src/pages`, uma pasta para cada tela                                            |
| Home/landing                    | `LandingPage`                                                                             |
| Download                        | `DownloadPage` + endpoints `/api/downloads*`                                              |
| Conversão                       | `ConvertPage` + endpoint `/api/conversions`                                               |
| Histórico                       | `HistoryPage` + endpoints `/api/history*`                                                 |
| Comunicação via services        | `frontend/src/services` e cliente comum em `api.js`                                       |
| CSS separado                    | CSS Module por página/componente; nenhum CSS monolítico                                   |
| Estilos globais                 | `frontend/src/styles/global.css` com tokens e paleta                                      |
| React Router DOM                | `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink` e `Outlet`                          |
| Sequelize                       | `Job` com PostgreSQL (`pg`) e migração versionada (#12)                                   |
| Swagger para documentar/testar  | `/api-docs`, `/api-docs.json` e `backend/src/docs/openapi.js`                             |
| Documentação no frontend        | `frontend/docs` com telas, componentes, testes e manutenção                               |
| GitHub Projects Board           | Quadro real: https://github.com/users/NicolasHMartinsP/projects/1        |
| Issues com responsável e aceite | Issues publicadas no repositório; Projects é a fonte oficial           |
| Legibilidade e manutenção       | Funções nomeadas, separação por responsabilidade, Prettier e guia de leitura              |
| Paleta enviada                  | Nova paleta aprovada; implementação pendente na #15                                |

## Entregas atuais

| Entrega | Issue | Situação |
| --- | --- | --- |
| PostgreSQL obrigatório | #12 | Implementado |
| MP4/MP3 por link compartilhado de fontes suportadas | #4 | Planejado; só link direto existe |
| Conversões principais de imagem, áudio e vídeo | #14 | Motor existente; validação da matriz pendente |
| Interface minimalista | #15 | Planejado |
| Usuários/sessões e histórico privado | #13, #16, #17 | Posterior às ferramentas públicas |
| Verificação e apresentação | #18, #11 | Pendente |

## Paleta aprovada

| Cor principal | Uso |
| --- | --- |
| #171219 | Fundo |
| #355834 | Ações e seleção |
| #D33F49 | Acentos e erros |

Branco/cinza são neutros de texto. Implementar contraste legível, espaçamento 8/16/24/32 px, grão estático discreto e transições de 120–180 ms.
A paleta anterior ainda está no CSS; a troca será realizada na #15.
Conversão no navegador é melhoria posterior. Não prometer suporte universal a links nem conversão PDF/Office nesta primeira entrega.
