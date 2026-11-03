# DropZone

Aplicação acadêmica para baixar mídias por link direto, converter arquivos e consultar o histórico. Interface em português, com a paleta enviada: verde neon, verde escuro, azul marinho, azul e roxo.

## Escopo atual (revisado em 2026-11-03)

O DropZone passa a ter duas ferramentas públicas, sem cadastro, e uma conta opcional:

| Funcionalidade    | Onde roda                                            | Situação                                                                                                                                                                                                                                               |
| ----------------- | ---------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Downloads por URL | Backend como intermediário, com proteção contra SSRF | Implementado; validação com site externo real pendente ([#4](https://github.com/NicolasHMartinsP/Dropzone/issues/4))                                                                                                                                   |
| Conversão local   | **Navegador** — o arquivo não é enviado ao backend   | **Planejado** ([#14](https://github.com/NicolasHMartinsP/Dropzone/issues/14), [#15](https://github.com/NicolasHMartinsP/Dropzone/issues/15)). Hoje a conversão ainda é feita no servidor                                                               |
| Conta e histórico | Backend guarda só metadados, por usuário             | **Planejado** ([#13](https://github.com/NicolasHMartinsP/Dropzone/issues/13), [#16](https://github.com/NicolasHMartinsP/Dropzone/issues/16), [#17](https://github.com/NicolasHMartinsP/Dropzone/issues/17)). Hoje o histórico é global e não tem login |

As seções abaixo descrevem a **implementação atual**, anterior a essa revisão. A conversão no servidor (Sharp/FFmpeg) continua no código até a conversão local estar pronta e a remoção ser analisada ([#18](https://github.com/NicolasHMartinsP/Dropzone/issues/18)). Planejamento e ordem das tarefas: [github-projects.md](frontend/docs/github-projects.md).

## Iniciar em poucos minutos

Pré-requisito: Node.js **22.12 ou superior** com npm. Os dois servidores precisam ficar abertos em terminais separados.

**Terminal 1 — API:**

```bash
cd backend
npm ci
npm run dev
```

**Terminal 2 — interface:**

```bash
cd frontend
npm ci
npm run dev
```

Abra:

| Endereço local                   | O que abre                             |
| -------------------------------- | -------------------------------------- |
| http://localhost:5173            | Aplicação React                        |
| http://localhost:3333/api-docs   | Swagger com “Try it out”               |
| http://localhost:3333/api/health | Situação da API e formatos disponíveis |

Não é necessário configurar banco, criar `.env` ou instalar um servidor PostgreSQL. O SQLite é criado em `backend/storage/dropzone.sqlite`. As migrações rodam automaticamente na inicialização. Você também pode executá-las com `npm run db:migrate` dentro de `backend`.

### Áudio e vídeo

Imagens funcionam após `npm ci`. Para áudio e vídeo, instale **FFmpeg e FFprobe** no computador e deixe ambos no PATH. Consulte o [download oficial do FFmpeg](https://ffmpeg.org/download.html).

Confira em um terminal:

```bash
ffmpeg -version
ffprobe -version
```

Depois reinicie o backend. Se precisar usar caminhos específicos, copie `backend/.env.example` para `backend/.env` e ajuste `FFMPEG_PATH` e `FFPROBE_PATH`. Caminhos com espaços podem ser colocados entre aspas no `.env`. Sem os programas, a interface informa a limitação e mantém as conversões de imagem disponíveis.

## O que está implementado

| Tela                | Rota         | Comportamento                                                     |
| ------------------- | ------------ | ----------------------------------------------------------------- |
| Landing page / home | `/`          | Apresentação, ferramentas, passos e dúvidas frequentes            |
| Downloads           | `/downloads` | Analisa um link direto e prepara o arquivo no formato escolhido   |
| Conversor           | `/conversor` | Recebe um arquivo por seleção ou arraste e converte seu conteúdo  |
| Histórico           | `/historico` | Busca, filtros, paginação, estatísticas, novo download e exclusão |

O enunciado fala em três telas, mas enumera quatro. Todas as quatro foram incluídas. Não há cadastro: este MVP é destinado a uso local e individual.

### Formatos e limites

| Entrada                                                        | Saída                                              |
| -------------------------------------------------------------- | -------------------------------------------------- |
| Imagem estática PNG, JPG, WebP ou AVIF                         | PNG, JPG, WebP, AVIF                               |
| Áudio reconhecido, como MP3, WAV, OGG, M4A ou FLAC, com FFmpeg | MP3, WAV, OGG                                      |
| Vídeo reconhecido, como MP4, WebM, MOV ou MKV, com FFmpeg      | MP4, WebM e, se houver faixa de áudio, MP3/WAV/OGG |
| Link direto HTTP/HTTPS de mídia compatível                     | Original ou conversão compatível                   |

- Entrada: até **50 MB**. Imagens: até **20 megapixels**. Áudio/vídeo: até **10 minutos**.
- Saída: até **200 MB**; processamento: até **2 minutos**.
- Dois processamentos simultâneos; até 20 solicitações de processamento por minuto e por IP.
- Uma análise de link guarda a fonte por 15 minutos. Até dez fontes podem aguardar processamento.
- Resultados ficam disponíveis por **24 horas**, por padrão. A limpeza verifica arquivos a cada minuto e na inicialização. O histórico permanece até exclusão manual.
- “Original” preserva os bytes; conversões podem alterar tamanho e qualidade. JPG perde transparência e recebe fundo branco. Metadados de imagens não são preservados.
- O registro de download significa que o arquivo foi **preparado no servidor**. O navegador ainda precisa salvá-lo pelo botão “Salvar arquivo”.

**Links de páginas do YouTube/Instagram, HLS/DASH, playlists, login, DRM, PDFs, documentos Office e imagens animadas não são suportados nesta versão.** Para demonstrar downloads, use uma URL que aponte diretamente para uma mídia pública. Não basta renomear a extensão: o backend inspeciona o conteúdo.

## Organização e leitura do código

| Pasta                            | Responsabilidade                                        |
| -------------------------------- | ------------------------------------------------------- |
| `frontend/src/pages`             | Telas e estado de cada fluxo                            |
| `frontend/src/components`        | Componentes reutilizáveis, cada um com JSX e CSS Module |
| `frontend/src/services`          | Toda comunicação HTTP da interface                      |
| `frontend/src/contexts`          | Conexão com a API e avisos globais                      |
| `frontend/src/styles/global.css` | Paleta, tokens, reset e estilos realmente globais       |
| `frontend/docs`                  | Telas, componentes, testes, manutenção e planejamento   |
| `backend/src/routes`             | Rotas e middlewares de cada endpoint                    |
| `backend/src/controllers`        | Leitura da requisição e montagem da resposta            |
| `backend/src/services`           | Processamento, acesso remoto e consultas do histórico   |
| `backend/src/models`             | Modelo Sequelize                                        |
| `backend/src/database`           | Migrações versionadas                                   |
| `backend/src/docs`               | Especificação OpenAPI exibida no Swagger                |
| `backend/tests`                  | Testes de integração da API                             |

**Comece a leitura por:** `frontend/src/App.jsx` → uma página → o service chamado por ela → `backend/src/routes/api.routes.js` → controller → service → model. Veja o exemplo explicado em [arquitetura.md](frontend/docs/arquitetura.md).

Foi adotada uma organização **MVC com services**, com React como camada de apresentação. “MCP” foi interpretado como possível referência a MVC; **não foi implementado um servidor Model Context Protocol**. Se a sigla do professor representar outro padrão, essa parte deve ser confirmada antes da apresentação.

O código usa módulos ES, nomes explícitos e funções com responsabilidades delimitadas. Comentários explicam decisões relevantes. O Prettier padroniza a formatação; não foi adicionado um framework de arquitetura nem uma camada de repositories para este tamanho de projeto.

## Verificação

Na pasta `backend`:

```bash
npm test
```

Na pasta `frontend`:

```bash
npm run build
```

Os testes usam banco em memória e diretório temporário; não alteram seu histórico. Com FFmpeg presente, verificam também arquivos reais de áudio/vídeo. Sem FFmpeg, esse cenário é marcado como ignorado.

Confira o que foi verificado e o que ainda depende do seu computador em [testes.md](frontend/docs/testes.md). Não foi validado um download real de site externo neste ambiente; no teste de download, apenas o transporte remoto é substituído por uma fonte controlada. A prévia web deste ambiente não alcançou o backend executado separadamente, então a integração completa no navegador deve ser conferida localmente.

Para padronizar alterações, na raiz do projeto:

```bash
npx prettier@3.6.2 --write frontend/src backend/src backend/tests
```

## GitHub Projects e documentação

O quadro **DropZone | Desenvolvimento** tem exatamente **A fazer**, **Em andamento**, **Testes** e **Concluído**, com cartões vinculados às Issues deste repositório.

- [github-projects.md](frontend/docs/github-projects.md): link do quadro, campos, ordem das entregas e fluxo de trabalho.
- [backlog.json](frontend/docs/backlog.json): resumo das tarefas e de sua situação.
- `.github/ISSUE_TEMPLATE/tarefa.yml`: formulário para novas tarefas no repositório.
- [telas.md](frontend/docs/telas.md): telas e situação.
- [componentes.md](frontend/docs/componentes.md): catálogo e responsabilidades.
- [manutencao.md](frontend/docs/manutencao.md): como ampliar o projeto.
- [requisitos.md](frontend/docs/requisitos.md): relação entre requisitos e arquivos.

## Configuração opcional

Use os `.env.example` como referência. Não versione arquivos `.env`, banco, resultados ou `node_modules`.

| Variável                               | Padrão                      | Uso                                    |
| -------------------------------------- | --------------------------- | -------------------------------------- |
| Backend `PORT`                         | `3333`                      | Porta da API                           |
| Backend `HOST`                         | `127.0.0.1`                 | Escuta somente no computador local     |
| Backend `CLIENT_ORIGIN`                | `http://localhost:5173`     | Origem liberada no CORS                |
| Backend `DB_STORAGE`                   | `./storage/dropzone.sqlite` | Caminho do SQLite, relativo ao backend |
| Backend `MAX_FILE_SIZE_MB`             | `50`                        | Limite de entrada                      |
| Backend `FILE_RETENTION_HOURS`         | `24`                        | Prazo dos resultados                   |
| Backend `FFMPEG_PATH` / `FFPROBE_PATH` | `ffmpeg` / `ffprobe`        | Executáveis                            |
| Frontend `VITE_BACKEND_URL`            | `http://127.0.0.1:3333`     | Destino do proxy de desenvolvimento    |
| Frontend `VITE_API_URL`                | vazio                       | URL pública da API, se não usar proxy  |

`VITE_*` é incorporado ao JavaScript do navegador: nunca coloque segredos nessas variáveis. O comando `npm run preview` serve apenas o build estático e não substitui a configuração de proxy/API de uma publicação. Para apresentar hoje, use os dois servidores de desenvolvimento.

## Roteiro de apresentação

1. Mostre a landing e a navegação com React Router DOM.
2. No conversor, envie `examples/imagem-exemplo.png` e escolha WebP.
3. Salve o resultado e abra o histórico; teste busca, filtros e novo download.
4. Faça um download com link direto de uma mídia pública.
5. Abra o Swagger e execute `GET /api/health` e `GET /api/history`.
6. Mostre as pastas separadas, CSS Modules, services e o catálogo de componentes.
7. Apresente o quadro do GitHub Projects.

Este roteiro descreve a implementação atual e será revisado na DZ-11 ([#11](https://github.com/NicolasHMartinsP/Dropzone/issues/11)) após a conversão local.

## Referências principais

- [Vite](https://vite.dev/guide/)
- [React Router](https://reactrouter.com/start/declarative/installation)
- [Sequelize 6](https://sequelize.org/docs/v6/getting-started/)
- [Sharp](https://sharp.pixelplumbing.com/api-output/)
- [Swagger: upload de arquivos](https://swagger.io/docs/specification/v3_0/describing-request-body/file-upload/)
- [GitHub Projects: quadro](https://docs.github.com/pt/issues/planning-and-tracking-with-projects/customizing-views-in-your-project/customizing-the-board-layout)
