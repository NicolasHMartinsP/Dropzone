# Requisitos

## Requisitos para rodar

| Item | Versão / observação |
| --- | --- |
| Node.js | 22.12 ou superior (frontend e backend) |
| npm | Instalado junto com o Node.js |
| PostgreSQL | Em execução, com um banco criado e informado em `DATABASE_URL` |
| FFmpeg e FFprobe | Necessários apenas para áudio e vídeo; imagens funcionam sem eles |
| Navegador | Atual, com suporte a `<dialog>`, `AbortSignal.timeout` e `AbortSignal.any` |
| Portas livres | `3333` (API) e `5173` (interface) |

## Requisitos funcionais

| # | Requisito | Situação | Onde está |
| --- | --- | --- | --- |
| RF01 | Baixar mídia a partir de um link direto HTTP/HTTPS | Implementado | `DownloadPage`, `POST /api/downloads/inspect` e `POST /api/downloads` |
| RF02 | Mostrar prévia e formatos compatíveis antes de baixar | Implementado | `MediaStage`, `GET /api/downloads/:id/preview` |
| RF03 | Baixar MP4/MP3 por links compartilhados de fontes suportadas | Pendente (#4) | — |
| RF04 | Converter imagens entre PNG, JPG, WebP e AVIF | Implementado | `ConvertPage`, `POST /api/conversions` (Sharp) |
| RF05 | Converter áudio (MP3, WAV, OGG) e vídeo (MP4, WebM) e extrair áudio de vídeo | Implementado com FFmpeg; validação completa da matriz pendente (#14) | `conversion.service.js` |
| RF06 | Selecionar arquivo por clique ou arraste, um por vez | Implementado | `FileDropzone` |
| RF07 | Listar o histórico com filtros, busca e paginação | Implementado | `HistoryPage`, `GET /api/history` |
| RF08 | Baixar novamente um resultado ainda disponível | Implementado | `HistoryTable`, `GET /api/files/:id` |
| RF09 | Excluir um registro ou limpar todo o histórico, com confirmação | Implementado | `ConfirmDialog`, `DELETE /api/history/:id` e `DELETE /api/history` |
| RF10 | Cadastrar usuário | Implementado (#16) | `RegisterPage`, `POST /api/users` |
| RF11 | Entrar e sair da conta | Implementado (#16) | `LoginPage`, `POST /api/auth/login` e `/logout` |
| RF12 | Ver e editar nome e e-mail | Implementado (#46) | `ProfilePage`, `GET` e `PATCH /api/users/me` |
| RF13 | Trocar a senha, encerrando as sessões de outros aparelhos | Implementado | `ProfilePage`, `PATCH /api/users/me` |
| RF14 | Excluir a conta e as sessões | Implementado | `ProfilePage`, `DELETE /api/users/me` |
| RF15 | Histórico privado por usuário | Pendente (#17) | — |

### CRUD da entidade Usuário

| Operação | Tela | Rota da API | Arquivo |
| --- | --- | --- | --- |
| Create | `/cadastro` → Criar conta | `POST /api/users` | `RegisterPage.jsx` |
| Read | `/perfil` (nome, e-mail e data de criação) | `GET /api/users/me` | `ProfilePage.jsx` |
| Update | `/perfil` → Salvar dados / Trocar senha | `PATCH /api/users/me` | `ProfilePage.jsx` |
| Delete | `/perfil` → Excluir conta → confirmar | `DELETE /api/users/me` | `ProfilePage.jsx` |

O histórico (`/historico`) complementa a leitura de vários registros, com listagem, filtro e exclusão individual da tabela `jobs`.

## Requisitos não funcionais

| Requisito | Como é atendido |
| --- | --- |
| Limites de processamento | Entrada até 50 MB, imagens até 20 megapixels, áudio/vídeo até 10 minutos, saída até 200 MB, processamento até 2 minutos e no máximo 2 operações simultâneas |
| Limite de requisições | 20 operações por minuto por IP; login com 10 tentativas a cada 15 minutos |
| Retenção | Resultados disponíveis por 24 horas (ajustável); limpeza automática a cada minuto |
| Segurança de senha | Hash scrypt com salt; a senha nunca é devolvida pela API |
| Sessão | Token aleatório em cookie HttpOnly (`SameSite=Lax`), salvo no banco apenas como hash, válido por 7 dias |
| Segurança de downloads | Bloqueio de endereços locais/privados, IP fixado após validação do DNS, redirecionamentos revalidados |
| Respostas sem dados internos | `filePath` e `sourceUrl` não são expostos nas listagens |
| Acessibilidade | Link "Pular para o conteúdo", `label` em campos, `aria-label` em botões de ícone, mensagens com `role="status"`/`role="alert"`, navegação por teclado no menu |
| Execução local | Sem hospedagem nem armazenamento em nuvem |

## Rastreabilidade dos requisitos da disciplina

| Requisito | Implementação / evidência |
| --- | --- |
| React e Vite | `frontend/package.json`, `src/main.jsx`, `vite.config.js` |
| Node | `backend/package.json`, `src/server.js` |
| Front e back separados | Dois `package.json`, dois locks, dois `.env.example` e servidores próprios (5173 e 3333) |
| Organização MCP | Tratada como MVC com services; explicada no README e em `arquitetura.md` |
| Componentes reutilizáveis | `frontend/src/components`; catálogo em `componentes.md` |
| Telas divididas por setor | `frontend/src/pages`, uma pasta para cada tela |
| Home / landing | `LandingPage` com as ferramentas de download e conversão |
| Download | `DownloadPage` + `/api/downloads*` |
| Conversão | `ConvertPage` + `/api/conversions` |
| Histórico | `HistoryPage` + `/api/history*` |
| CRUD pela interface | Entidade Usuário: `RegisterPage` e `ProfilePage` + `/api/users*` |
| Comunicação via services | `frontend/src/services` com cliente comum em `api.js` |
| CSS separado | Um CSS Module por componente/página; nenhum CSS monolítico |
| Estilos globais | `frontend/src/styles/global.css` com tokens e paleta |
| React Router DOM | `BrowserRouter`, `Routes`, `Route`, `Link`, `NavLink`, `Outlet` e `Navigate` |
| Sequelize | Models `Job`, `User` e `Session` com PostgreSQL e migrações versionadas (#12) |
| Swagger para documentar e testar | `/api-docs`, `/api-docs.json` e `backend/src/docs/swagger.js` |
| Testes | `backend/tests` com Node Test Runner e Supertest |
| Documentação no frontend | `frontend/docs`: arquitetura, componentes e requisitos |
| GitHub Projects Board | https://github.com/users/NicolasHMartinsP/projects/1 |
| Issues e Pull Requests | Issues no repositório, branches por funcionalidade e merges por PR |
| Legibilidade e manutenção | Funções nomeadas, separação por responsabilidade e Prettier |

## Entregas atuais

| Entrega | Issue | Situação |
| --- | --- | --- |
| PostgreSQL obrigatório | #12 | Implementado |
| MP4/MP3 por link compartilhado de fontes suportadas | #4 | Planejado; só link direto existe |
| Conversões principais de imagem, áudio e vídeo | #14 | Motor implementado; validação da matriz pendente |
| Interface minimalista | #15 | Planejado |
| Conta de usuário (cadastro, login, perfil, exclusão) | #16, #46 | Implementado |
| Histórico privado por usuário | #17 | Pendente |
| Verificação e apresentação | #18, #11 | Pendente |

## Paleta aprovada

| Cor principal | Uso |
| --- | --- |
| #171219 | Fundo |
| #355834 | Ações e seleção |
| #D33F49 | Acentos e erros |

Branco e cinza são os neutros de texto. A implementação deve ter contraste legível, espaçamento 8/16/24/32 px, grão estático discreto e transições de 120–180 ms.

A interface atual ainda usa a paleta anterior (fundo azul-marinho, acento verde neon e roxo); a troca será feita na #15.

## Fora do escopo desta entrega

- Conversão de PDF e documentos do Office.
- Playlists, lotes e páginas de plataformas (YouTube, Instagram etc.) sem o adaptador de links compartilhados.
- Login em plataformas de terceiros.
- Conversão executada no navegador (melhoria posterior).
