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
| Sequelize                       | Modelo `Job`, conexão SQLite e migrações versionadas                                      |
| Swagger para documentar/testar  | `/api-docs`, `/api-docs.json` e `backend/src/docs/openapi.js`                             |
| Documentação no frontend        | `frontend/docs` com telas, componentes, testes e manutenção                               |
| GitHub Projects Board           | Backlog e instruções preparados; criação externa depende do repositório de destino        |
| Issues com responsável e aceite | `.github/ISSUE_TEMPLATE/tarefa.yml` e `docs/backlog.json`; não publicadas ainda           |
| Legibilidade e manutenção       | Funções nomeadas, separação por responsabilidade, Prettier e guia de leitura              |
| Paleta enviada                  | Cores-base extraídas da imagem e definidas em `global.css`                                |

## Paleta

Valores aproximados extraídos das áreas centrais da imagem de referência:

| Cor          | Hexadecimal | Uso                                         |
| ------------ | ----------- | ------------------------------------------- |
| Verde neon   | `#1EFD4A`   | Ações principais, marca, pequenos destaques |
| Verde escuro | `#0A3D14`   | Referência para tons de sucesso             |
| Azul marinho | `#041447`   | Base visual e arte da landing               |
| Azul         | `#3E43B8`   | Superfícies e elementos da ilustração       |
| Roxo         | `#8488F6`   | Seleção, ícones e destaque tipográfico      |

Tons auxiliares mais escuros e neutros garantem legibilidade. A imagem não contém códigos impressos; por isso os valores são amostrados, não uma especificação oficial da paleta.
