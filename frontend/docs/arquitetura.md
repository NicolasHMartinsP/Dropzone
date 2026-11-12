# Arquitetura e tecnologias

Este documento descreve o código como ele está hoje. Atualize-o junto com cada implementação.

O projeto tem duas aplicações independentes, cada uma com seu `package.json`, lock e `.env.example`:

- **frontend/**: interface React servida pelo Vite na porta `5173`.
- **backend/**: API REST em Express na porta `3333`, com PostgreSQL, Sharp e FFmpeg.

O frontend conhece a API apenas por HTTP. O navegador nunca acessa o banco, o Sequelize ou os caminhos de arquivos do servidor.

## Tecnologias

### Frontend

| Tecnologia | Versão | Uso no projeto |
| --- | --- | --- |
| React | 19 | Componentes, estado (`useState`, `useEffect`) e Context API |
| React DOM | 19 | Renderização em `main.jsx` |
| React Router DOM | 7 | `BrowserRouter`, `Routes`, `Route`, `NavLink`, `Link`, `Outlet`, `Navigate` |
| Vite | 8 | Servidor de desenvolvimento, proxy de `/api` e `/api-docs`, build |
| @vitejs/plugin-react | 6 | Suporte a JSX e recarregamento rápido |
| CSS Modules | — | Um `Nome.module.css` por componente/página |
| lucide-react | 0.468 | Ícones, centralizados no componente `Icon` |
| @fontsource/dm-sans e space-grotesk | 5 | Fontes servidas localmente |

O frontend exige Node.js 22.12 ou superior (`engines` no `package.json`).

### Backend

| Tecnologia | Uso no projeto |
| --- | --- |
| Node.js 22.12+ | Execução da API com ES Modules |
| Express 5 | Rotas, middlewares e respostas JSON |
| PostgreSQL + `pg` | Banco de dados |
| Sequelize 6 | Models `Job`, `User` e `Session` e migrações |
| Sharp | Conversão de imagens |
| FFmpeg / FFprobe | Conversão e análise de áudio e vídeo |
| Multer | Recebimento do upload em disco |
| cookie-parser | Leitura do cookie de sessão `dz_session` |
| `node:crypto` (scrypt) | Hash de senhas e de tokens de sessão |
| Helmet, CORS, express-rate-limit | Cabeçalhos de segurança, origem permitida e limite de requisições |
| dotenv | Leitura do `.env` |
| swagger-ui-express | Documentação em `/api-docs` |
| Node Test Runner + Supertest | Testes da API |

## Organização do frontend

```text
frontend/src/
├── main.jsx        # BrowserRouter → AuthProvider → AppProvider → App
├── App.jsx         # tabela de rotas dentro do Layout
├── components/     # apresentação reutilizável
├── pages/          # uma pasta por tela; coordena o fluxo
├── contexts/       # AppContext (conexão e avisos) e AuthContext (usuário logado)
├── services/       # todas as chamadas HTTP
├── hooks/          # useDebounce
├── utils/          # formatBytes, formatDate, fileKind
└── styles/         # global.css com tokens, paleta e classes utilitárias
```

### Onde colocar cada mudança

| Tipo de código | Local |
| --- | --- |
| Apresentação reutilizada | `components/` |
| Sequência da operação e estado do formulário | `pages/` |
| Pedido HTTP | `services/`, nunca `fetch` direto na página |
| Estado compartilhado entre telas | `contexts/` |
| Transformação pequena e pura de dados | `utils/` |
| Cores, fontes e espaçamentos gerais | `styles/global.css` |

### Rotas

| Rota | Tela | Acesso |
| --- | --- | --- |
| `/` e `/downloads` | `LandingPage` exibindo `DownloadPage` | Público |
| `/conversor` | `LandingPage` exibindo `ConvertPage` | Público |
| `/historico` | `HistoryPage` | Público |
| `/login` | `LoginPage` | Público |
| `/cadastro` | `RegisterPage` | Público |
| `/perfil` | `ProfilePage` dentro de `RequireLogin` | Exige login |
| `*` | `NotFoundPage` | Público |

Todas as rotas ficam dentro do `Layout`, que mostra o `Header` e, fora das telas de ferramenta, o `Footer`. A `LandingPage` mantém `DownloadPage` e `ConvertPage` montadas ao mesmo tempo e só alterna qual está visível, para não perder o arquivo ou o resultado ao trocar de ferramenta.

### Estado global

- **AppContext:** consulta `GET /api/health` ao abrir e a cada 30 segundos. Expõe `health` (capacidades, formatos, limites e retenção), `connection` (`checking`, `online` ou `offline`) e `notify(mensagem, tipo)`, que exibe o `Toast` por 5 segundos.
- **AuthContext:** consulta `GET /api/users/me` ao abrir para saber se há sessão. Expõe `user`, `checking`, `login`, `register`, `logout`, `updateProfile` e `deleteAccount`.

### Comunicação com a API

`services/api.js` concentra o cliente HTTP:

- `request(path, { method, body, signal })`: envia JSON ou `FormData`, aplica tempo limite de 155 s e transforma erros da API (`error.message`) em `Error` com texto em português. Respostas `204` retornam `null`.
- `saveFile(job)`: baixa o binário de `job.downloadUrl` e pede ao navegador para salvar com `job.outputName`.
- `mediaUrl(path)` e `apiDocsUrl`: montam endereços com a base da API.

Por padrão a base é vazia e o proxy do Vite encaminha `/api` e `/api-docs` para `VITE_BACKEND_URL` (`http://127.0.0.1:3333`). Para chamar a API sem proxy, defina `VITE_API_URL`.

| Service | Funções | Endpoints |
| --- | --- | --- |
| `api.js` (`systemService`) | `health` | `GET /api/health` |
| `download.service.js` | `inspect`, `create` | `POST /api/downloads/inspect`, `POST /api/downloads` |
| `conversion.service.js` | `convert` | `POST /api/conversions` |
| `history.service.js` | `list`, `stats`, `remove`, `clear` | `GET /api/history`, `GET /api/history/stats`, `DELETE /api/history/:id`, `DELETE /api/history` |
| `auth.service.js` | `register`, `login`, `logout`, `me`, `updateMe`, `deleteMe` | `POST /api/users`, `POST /api/auth/login`, `POST /api/auth/logout`, `GET`/`PATCH`/`DELETE /api/users/me` |

## Organização do backend (MVC com services)

| Camada | Local | Responsabilidade |
| --- | --- | --- |
| Routes | `backend/src/routes` | Um arquivo por recurso; mapeia endpoints e middlewares |
| Middlewares | `backend/src/middlewares` | `auth.js`, `upload.js`, `rateLimits.js`, `errorHandler.js` |
| Controllers | `backend/src/controllers` | Lê a requisição, chama o service e monta a resposta |
| Services | `backend/src/services` | Regras de negócio e processamento |
| Models | `backend/src/models` | Estrutura e persistência pelo Sequelize |
| View | Aplicação React separada | Apresenta os dados e captura ações |

O termo "MCP" do requisito foi tratado como MVC; não existe integração Model Context Protocol.

### Services

| Arquivo | Responsabilidade |
| --- | --- |
| `conversion.service.js` | Descobrir capacidades (FFmpeg disponível?), identificar conteúdo e executar Sharp/FFmpeg |
| `remote.service.js` | Validar URL, DNS e redirecionamentos e receber mídia com limite de bytes |
| `job.service.js` | Coordenar jobs, fontes analisadas, resultados, retenção e limpeza |
| `history.service.js` | Consultar, filtrar, paginar, calcular estatísticas e excluir registros |
| `users.service.js` | Validar e gravar cadastro, edição e exclusão de usuários |
| `auth.service.js` | Login, criação e busca de sessões, limpeza de sessões vencidas |

### Models

**Job** (tabela `jobs`): `id`, `kind` (`download` ou `conversion`), `status` (`processing`, `completed` ou `failed`), `inputName`, `outputName`, `inputFormat`, `outputFormat`, `mimeType`, `sizeBytes`, `sourceUrl` (não devolvida na listagem), `filePath` (nunca devolvido), `errorMessage`, `createdAt`, `updatedAt`, `completedAt` e `expiresAt`.

**User** (tabela `users`): `id` (UUID), `name` (1 a 20 caracteres), `email` (único, até 70 caracteres) e `passwordHash`.

**Session** (tabela `sessions`): `id`, `userId` (FK para `users` com `ON DELETE CASCADE`), `tokenHash` (SHA-256 do token) e `expiresAt` (7 dias, renovado a cada uso).

As tabelas são criadas pelas migrações `001-create-jobs.js` e `002-create-users-and-sessions.js`, aplicadas automaticamente ao iniciar a API.

## Exemplo: converter PNG para WebP

1. `ConvertPage` recebe o arquivo do `FileDropzone`, verifica tipo e tamanho e mostra a prévia no `MediaStage`.
2. `conversionService.convert` cria um `FormData` e chama `request` em `services/api.js`.
3. O Vite encaminha `/api/conversions` para a API.
4. `conversions.routes.js` aplica `processingLimit` e o Multer grava o upload no disco.
5. `conversion.controller.js` confere os campos e chama o service.
6. `job.service.js` identifica o conteúdo, cria um Job em processamento e coordena o resultado.
7. `conversion.service.js` converte com Sharp (imagens) ou FFmpeg (áudio/vídeo).
8. O Job é atualizado no PostgreSQL pelo Sequelize e o arquivo de entrada é removido.
9. A API devolve os metadados públicos e o `downloadUrl`, sem expor caminhos do servidor.
10. O `MediaStage` mostra o resultado; ao clicar em "Salvar arquivo", `saveFile` baixa o binário.

## Exemplo: criar conta

1. `RegisterPage` envia nome, e-mail e senha para `register` do `AuthContext`.
2. `authService.register` chama `POST /api/users`; `users.service.js` valida os dados e grava a senha com hash scrypt.
3. Em seguida o contexto chama `login`, que faz `POST /api/auth/login`; a API cria uma `Session` e envia o cookie HttpOnly `dz_session`.
4. O contexto guarda o usuário e a página navega para `/perfil`.
5. Nas próximas requisições a `/api/users/me`, o middleware `requireAuth` encontra a sessão pelo cookie e renova o prazo.

## Decisões de escopo

- Não há fila distribuída: cada operação aguarda o processamento na própria requisição HTTP, com no máximo duas em paralelo.
- Fontes analisadas no download ficam em memória por 15 minutos e se perdem ao reiniciar; o histórico e os resultados concluídos permanecem.
- Na inicialização, jobs interrompidos são marcados como falhos, entradas antigas são removidas e arquivos órfãos são limpos. A limpeza também roda a cada minuto.
- O backend usa caminhos gerados por UUID, valida conteúdo e tamanho, bloqueia IPs não públicos, fixa o IP validado na conexão e revalida redirecionamentos. O FFmpeg recebe argumentos sem shell e playlists são rejeitadas.
- O histórico ainda não é separado por usuário (#17).
- Isso não transforma o projeto em um serviço público pronto para a internet: isolamento por usuário, filas, isolamento do processo de mídia e armazenamento externo exigem uma evolução específica.
