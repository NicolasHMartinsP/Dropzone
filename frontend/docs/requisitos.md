# Rastreabilidade dos requisitos

## Escopo revisado (2026-11-03)

| Requisito                                                     | Situação                              | Issue                                                                                                                        |
| ------------------------------------------------------------- | ------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| Download de mídia por URL pública HTTP/HTTPS, sem cadastro    | Implementado; validação real pendente | [#4](https://github.com/NicolasHMartinsP/Dropzone/issues/4)                                                                  |
| Proteção contra SSRF e limites de tamanho/tempo               | Implementado                          | [#4](https://github.com/NicolasHMartinsP/Dropzone/issues/4)                                                                  |
| Conversão local no navegador, sem envio do arquivo ao backend | Planejado                             | [#14](https://github.com/NicolasHMartinsP/Dropzone/issues/14), [#15](https://github.com/NicolasHMartinsP/Dropzone/issues/15) |
| Exibir só formatos de saída realmente suportados              | Planejado                             | [#14](https://github.com/NicolasHMartinsP/Dropzone/issues/14), [#15](https://github.com/NicolasHMartinsP/Dropzone/issues/15) |
| Conta opcional (cadastro, login, logout, sessão)              | Planejado                             | [#13](https://github.com/NicolasHMartinsP/Dropzone/issues/13), [#16](https://github.com/NicolasHMartinsP/Dropzone/issues/16) |
| Histórico privado com metadados por usuário                   | Planejado                             | [#13](https://github.com/NicolasHMartinsP/Dropzone/issues/13), [#17](https://github.com/NicolasHMartinsP/Dropzone/issues/17) |
| Testes, revisão de segurança e documentação coerente          | Planejado                             | [#18](https://github.com/NicolasHMartinsP/Dropzone/issues/18)                                                                |

**Fora do escopo:** conversão obrigatória no servidor, login obrigatório, lote, filas/Redis, microsserviços, armazenamento permanente de arquivos, compartilhamento, monetização, painel administrativo, integrações com Drive/Dropbox, apps nativos. Login com Google/GitHub pode ser avaliado depois do MVP.

## Requisitos originais

| Requisito                       | Implementação / evidência                                                                                    |
| ------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| React e Vite                    | `frontend/package.json`, `src/main.jsx`, `vite.config.js`; build executável                                  |
| Node                            | `backend/package.json`, `src/server.js`                                                                      |
| Front e back separados          | Dois `package.json`, dois locks, dependências e comandos de desenvolvimento independentes                    |
| Organização MCP                 | Ponto a confirmar; adotado MVC com services, explicado no README e em `arquitetura.md`                       |
| Componentes reutilizáveis       | `frontend/src/components`; catálogo em `componentes.md`                                                      |
| Telas divididas por setor       | `frontend/src/pages`, uma pasta para cada tela                                                               |
| Home/landing                    | `LandingPage`                                                                                                |
| Download                        | `DownloadPage` + endpoints `/api/downloads*`                                                                 |
| Conversão                       | `ConvertPage` + endpoint `/api/conversions`                                                                  |
| Histórico                       | `HistoryPage` + endpoints `/api/history*`                                                                    |
| Comunicação via services        | `frontend/src/services` e cliente comum em `api.js`                                                          |
| CSS separado                    | CSS Module por página/componente; nenhum CSS monolítico                                                      |
| Estilos globais                 | `frontend/src/styles/global.css` com tokens e paleta                                                         |
| React Router DOM                | `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink` e `Outlet`                                             |
| Sequelize                       | Modelo `Job`, conexão SQLite e migrações versionadas                                                         |
| Swagger para documentar/testar  | `/api-docs`, `/api-docs.json` e `backend/src/docs/openapi.js`                                                |
| Documentação no frontend        | `frontend/docs` com telas, componentes, testes e manutenção                                                  |
| GitHub Projects Board           | [Quadro do projeto](https://github.com/users/NicolasHMartinsP/projects/1), detalhado em `github-projects.md` |
| Issues com responsável e aceite | Issues do repositório com Assignees e critérios; formulário em `.github/ISSUE_TEMPLATE/tarefa.yml`           |
| Legibilidade e manutenção       | Funções nomeadas, separação por responsabilidade, Prettier e guia de leitura                                 |
| Paleta enviada                  | Cores-base extraídas da imagem e definidas em `global.css`                                                   |

## Paleta

Valores aproximados extraídos das áreas centrais da imagem de referência:

| Cor          | Hexadecimal                                                             | Uso                                         |
| ------------ | ----------------------------------------------------------------------- | ------------------------------------------- |
| Verde neon   | `[#1](https://github.com/NicolasHMartinsP/Dropzone/issues/1)EFD4A`      | Ações principais, marca, pequenos destaques |
| Verde escuro | `[#0](https://github.com/NicolasHMartinsP/Dropzone/issues/0)A3D14`      | Referência para tons de sucesso             |
| Azul marinho | `[#041447](https://github.com/NicolasHMartinsP/Dropzone/issues/041447)` | Base visual e arte da landing               |
| Azul         | `[#3](https://github.com/NicolasHMartinsP/Dropzone/issues/3)E43B8`      | Superfícies e elementos da ilustração       |
| Roxo         | `[#8488](https://github.com/NicolasHMartinsP/Dropzone/issues/8488)F6`   | Seleção, ícones e destaque tipográfico      |

Tons auxiliares mais escuros e neutros garantem legibilidade. A imagem não contém códigos impressos; por isso os valores são amostrados, não uma especificação oficial da paleta.
