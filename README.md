# DropZone

## Prioridades aprovadas (2026-11-03)

1. Persistência com **PostgreSQL + Sequelize**, requisito obrigatório da faculdade (#12). **Implementado.**
2. Baixar **MP4/MP3 por links compartilhados** de fontes públicas suportadas, além dos links diretos (#4). **Pendente:** hoje só links diretos.
3. Validar conversões de imagens PNG/JPG/WebP, áudio MP3/WAV/OGG, vídeo MP4/WebM e extração MP4 → MP3 (#14). **Motor implementado;** validação completa da matriz pendente.
4. Simplificar a interface: #171219, #355834 e #D33F49, texto neutro legível, grão discreto, espaçamento consistente e animações curtas (#15). **Pendente:** a interface atual ainda usa a paleta anterior.
5. Conta e histórico privado de metadados (#13, #16 e #17). **Conta implementada** (cadastro, login, perfil e exclusão); o histórico ainda é compartilhado, sem vínculo com o usuário.

**Situação real:** o código usa PostgreSQL + Sequelize, aceita links diretos, converte no backend local com Sharp/FFmpeg e tem contas de usuário com sessão em cookie. Links compartilhados e histórico por usuário são trabalho pendente.
O adaptador de links compartilhados deve avaliar yt-dlp; suporte por fonte precisa ser testado e datado, sem promessa de compatibilidade universal.
PDF/Office, playlists/lotes e login em plataformas não fazem parte desta primeira entrega.

O [Project](https://github.com/users/NicolasHMartinsP/projects/1) é a fonte oficial de tarefas e status.


![React](https://img.shields.io/badge/React-19-149ECA?logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-22%2B-339933?logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-333333?logo=express&logoColor=white)
![Status](https://img.shields.io/badge/Status-Em%20desenvolvimento-orange)

> **Ferramenta pessoal para download de mídias por URLs diretas e conversão de arquivos**, desenvolvida com React, Node.js e uma arquitetura modular voltada à execução local.

---

## Problema e Solução

Converter arquivos ou baixar mídias disponíveis na internet costuma exigir diferentes ferramentas, instalações ou serviços online.

O **DropZone** centraliza essas operações em uma interface web simples: o usuário cola um link ou arrasta um arquivo, escolhe o formato de saída e salva o resultado direto no computador. Todas as operações ficam registradas em um histórico que pode ser consultado, filtrado e limpo.

A aplicação é executada localmente, sem depender de hospedagem ou serviços de conversão em nuvem.

**O projeto está em desenvolvimento**, com foco em simplicidade, manutenção e processamento eficiente de arquivos.

---

## Tecnologias

### Frontend

- **React 19:** construção da interface baseada em componentes.
- **Vite 8:** ambiente de desenvolvimento, proxy para a API e build.
- **JavaScript (JSX):** lógica da aplicação.
- **React Router DOM 7:** navegação entre páginas e rota protegida do perfil.
- **Context API:** estado global de conexão/avisos (`AppContext`) e de autenticação (`AuthContext`).
- **CSS Modules:** estilos isolados por componente e página, com tokens globais em `styles/global.css`.
- **Lucide React:** ícones da interface.
- **Fontsource (DM Sans e Space Grotesk):** fontes servidas localmente, sem depender do Google Fonts.

### Backend

- **Node.js 22.12+:** ambiente de execução JavaScript (ES Modules).
- **Express 5:** implementação da API REST.
- **PostgreSQL + Sequelize:** banco de dados relacional e ORM, com migrações versionadas.
- **Sharp:** processamento e conversão de imagens.
- **FFmpeg / FFprobe:** conversão e análise de áudio e vídeo.
- **Multer:** recebimento e validação inicial de uploads.
- **cookie-parser + scrypt (node:crypto):** sessões em cookie HttpOnly e senhas com hash.
- **Helmet / express-rate-limit / CORS:** proteções HTTP e controle de requisições.
- **dotenv:** leitura das configurações do arquivo `.env`.
- **Swagger UI / OpenAPI 3:** documentação interativa da API.
- **Node.js Test Runner + Supertest:** testes automatizados da API.

### Ferramentas

- **Prettier:** formatação padronizada do código.
- **Git e GitHub:** versionamento, Issues, Pull Requests e GitHub Projects.

---

## Arquitetura atual

A aplicação utiliza uma arquitetura em camadas, separando interface, comunicação HTTP, regras de negócio, processamento e persistência.

O frontend é responsável pela interação com o usuário, enquanto o backend local executa operações que dependem de acesso a arquivos, bibliotecas de conversão e armazenamento.

```text
                   DropZone
                      |
            +---------+---------+
            |                   |
            v                   v
      Frontend React       Backend Node.js
            |                   |
            v                   v
   Pages / Components      Routes + Middlewares
            |                   |
            v                   v
   Contexts / Services      Controllers
            |                   |
            |   proxy do Vite   v
            +------> /api    Services
                                |
           +--------------+-----+------+--------------+
           |              |            |              |
           v              v            v              v
       Downloads      Conversões   Histórico     Usuários/Sessões
           |              |            |              |
           |       Sharp / FFmpeg      +------+-------+
           |              |                   |
           +------+-------+               Sequelize
                  |                           |
                  v                       PostgreSQL
         Arquivos temporários
                  |
                  v
         Download do resultado
```

### Organização

O backend segue uma organização baseada em **MVC com Services**, mantendo responsabilidades separadas:

- **Routes:** definição dos endpoints e dos middlewares de cada recurso.
- **Controllers:** recebimento das requisições e construção das respostas.
- **Services:** processamento e regras de negócio.
- **Models:** representação e persistência dos dados (`Job`, `User`, `Session`).
- **Middlewares:** autenticação, upload, limites de requisição e tratamento de erros.
- **Database:** migrações versionadas, aplicadas automaticamente ao iniciar a API.
- **Shared:** utilitários e estruturas compartilhadas.

No frontend, as páginas coordenam o fluxo, os componentes cuidam da apresentação e os services concentram todas as chamadas HTTP.

Essa separação facilita manutenção, testes e implementação de novas funcionalidades. Detalhes em [frontend/docs/arquitetura.md](frontend/docs/arquitetura.md).

---

## Funcionalidades

### Downloads por URL

Permite analisar e baixar arquivos de mídia disponíveis em URLs públicas HTTP/HTTPS.

- Validação de URLs e bloqueio de endereços locais/privados.
- Análise do conteúdo recebido e identificação dos formatos compatíveis.
- Prévia da mídia antes de baixar (imagem, áudio ou vídeo).
- Download no formato original ou convertido.
- Tratamento de erros e endereços incompatíveis.
- Controle de tamanho e duração das requisições.

**Limitação:** atualmente, a aplicação trabalha com links diretos de mídia. Páginas de plataformas como YouTube e Instagram, playlists HLS/DASH e conteúdos protegidos por DRM não são suportados.

### Conversão de arquivos

Permite selecionar ou arrastar arquivos, ver a prévia e convertê-los para formatos compatíveis.

**Imagens**
- PNG
- JPG
- WebP
- AVIF

**Áudio**
- MP3
- WAV
- OGG

**Vídeo**
- MP4
- WebM
- Extração de áudio de vídeos compatíveis (MP3, WAV, OGG).

A conversão de imagens utiliza Sharp, enquanto áudio e vídeo dependem do FFmpeg. Sem o FFmpeg instalado, a interface libera apenas imagens.

As ferramentas de download e conversão ficam montadas ao mesmo tempo, então trocar de ferramenta não descarta o arquivo ou o resultado em andamento.

### Histórico

- Lista de downloads e conversões com nome, operação, data, situação e tamanho.
- Filtros por operação e situação, busca por nome e paginação (10 por página).
- Novo download de resultados ainda disponíveis.
- Exclusão individual ou limpeza completa, com confirmação.

### Conta de usuário

- Cadastro com nome, e-mail e senha (mínimo 8 caracteres).
- Login e logout com sessão em cookie HttpOnly válida por 7 dias.
- Perfil protegido: ver dados, editar nome e e-mail, trocar senha e excluir a conta.
- Ao trocar a senha, as sessões de outros aparelhos são encerradas.
- Ao excluir a conta, as sessões do usuário também são apagadas.

## Fluxo de Funcionamento

### Download

1. O usuário cola a URL de uma mídia pública.
2. O backend valida o endereço e analisa o conteúdo.
3. A interface mostra a prévia e os formatos compatíveis.
4. O usuário escolhe o formato e solicita a preparação do arquivo.
5. O resultado é disponibilizado para salvar no computador e registrado no histórico.

### Conversão

1. O usuário seleciona ou arrasta um arquivo.
2. A aplicação verifica o tipo e o tamanho e mostra a prévia.
3. O usuário escolhe um formato de saída compatível.
4. O backend processa o arquivo utilizando Sharp ou FFmpeg.
5. O resultado é disponibilizado para download.
6. A operação é registrada no histórico.

### Conta

1. O usuário se cadastra ou entra pela página `/login`.
2. A API cria uma sessão e envia o cookie `dz_session`.
3. O `AuthContext` guarda o usuário logado e o ícone de perfil passa a levar a `/perfil`.
4. No perfil, o usuário edita os dados, troca a senha, sai ou exclui a conta.

---

## Formatos e Limites

| Entrada | Saída |
|---|---|
| PNG, JPG, WebP, AVIF | PNG, JPG, WebP, AVIF |
| MP3, WAV, OGG, M4A, FLAC e áudio compatível | MP3, WAV, OGG |
| MP4, WebM, MOV, MKV e vídeo compatível | MP4, WebM |
| Vídeo com faixa de áudio | MP3, WAV, OGG |
| URL HTTP/HTTPS de mídia pública compatível | Arquivo original ou conversão compatível |

### Limites atuais

- **Entrada:** até 50 MB.
- **Imagens:** até 20 megapixels.
- **Áudio e vídeo:** até 10 minutos.
- **Saída:** até 200 MB.
- **Processamento:** até 2 minutos.
- **Simultaneidade:** até 2 operações em processamento.
- **Requisições:** até 20 operações por minuto por IP; login limitado a 10 tentativas a cada 15 minutos.
- **Retenção dos resultados:** 24 horas, por padrão.

O limite de entrada e o tempo de retenção podem ser ajustados no `.env`.

Arquivos temporários são removidos por uma rotina de limpeza que roda a cada minuto. Os registros do histórico permanecem até exclusão manual.

---

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 22.12 ou superior.
- npm.
- Git.
- PostgreSQL em execução, com um banco criado para o projeto.
- FFmpeg e FFprobe para conversões de áudio e vídeo.

As conversões de imagens funcionam sem a instalação do FFmpeg.

### Instalação

Clone o repositório:

```bash
git clone https://github.com/NicolasHMartinsP/Dropzone.git
cd Dropzone
```

### Backend

Em um terminal:

```bash
cd backend
cp .env.example .env   # ajuste o DATABASE_URL para o seu PostgreSQL
npm ci
npm run dev
```

As migrações são aplicadas automaticamente quando a API inicia. Para aplicá-las manualmente, use `npm run db:migrate`.

A API estará disponível em:

`http://localhost:3333`

### Frontend

Abra outro terminal a partir da pasta raiz:

```bash
cd frontend
npm ci
npm run dev
```

Acesse a interface:

`http://localhost:5173`

Os dois processos precisam permanecer ativos para utilizar a aplicação. Durante o desenvolvimento, o Vite encaminha `/api` e `/api-docs` para o backend.

### Scripts

| Pasta | Comando | O que faz |
|---|---|---|
| `backend` | `npm run dev` | Inicia a API e reinicia ao salvar arquivos |
| `backend` | `npm start` | Inicia a API |
| `backend` | `npm run db:migrate` | Aplica as migrações no banco |
| `backend` | `npm test` | Executa os testes automatizados |
| `frontend` | `npm run dev` | Inicia a interface em modo de desenvolvimento |
| `frontend` | `npm run build` | Gera a versão de produção em `dist/` |
| `frontend` | `npm run preview` | Serve a versão gerada pelo build |

### Configuração

Os arquivos `.env.example` do frontend e do backend apresentam as configurações disponíveis.

**Backend (`backend/.env`)**

| Variável | Padrão | Descrição |
|---|---|---|
| `PORT` | `3333` | Porta da API |
| `HOST` | `127.0.0.1` | Endereço em que a API escuta |
| `CLIENT_ORIGIN` | `http://localhost:5173` | Origem permitida no CORS |
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/dropzone` | Conexão com o PostgreSQL |
| `MAX_FILE_SIZE_MB` | `50` | Limite de tamanho dos arquivos de entrada |
| `FILE_RETENTION_HOURS` | `24` | Tempo de retenção dos resultados |
| `FFMPEG_PATH` / `FFPROBE_PATH` | `ffmpeg` / `ffprobe` | Caminhos do FFmpeg e FFprobe |
| `STORAGE_DIR` | `backend/storage` | Local dos arquivos temporários (opcional) |

**Frontend (`frontend/.env`, opcional)**

| Variável | Padrão | Descrição |
|---|---|---|
| `VITE_BACKEND_URL` | `http://127.0.0.1:3333` | Destino do proxy do Vite |
| `VITE_API_URL` | vazio | URL completa da API, quando não se usa o proxy |

**Não versione arquivos `.env`, credenciais, bancos locais ou arquivos temporários.**

---

## Estrutura do Projeto

```text
Dropzone/
├── frontend/
│   ├── public/              # favicon e textura de grão
│   ├── src/
│   │   ├── components/      # componentes reutilizáveis (.jsx + .module.css)
│   │   ├── contexts/        # AppContext e AuthContext
│   │   ├── hooks/           # useDebounce
│   │   ├── pages/           # uma pasta por tela
│   │   ├── services/        # chamadas HTTP à API
│   │   ├── styles/          # global.css (tokens e paleta)
│   │   ├── utils/           # formatação de bytes, datas e tipos de arquivo
│   │   ├── App.jsx          # rotas
│   │   └── main.jsx         # entrada do React
│   ├── docs/                # documentação do frontend
│   └── vite.config.js
│
├── backend/
│   ├── src/
│   │   ├── config/          # variáveis de ambiente e conexão com o banco
│   │   ├── controllers/
│   │   ├── database/        # migrate.js e migrations/
│   │   ├── docs/            # documento OpenAPI (Swagger)
│   │   ├── middlewares/     # auth, upload, rate limit e erros
│   │   ├── models/          # Job, User e Session
│   │   ├── routes/          # uma rota por recurso
│   │   ├── services/
│   │   ├── shared/
│   │   ├── app.js           # montagem do Express
│   │   └── server.js        # inicialização, migrações e limpeza
│   ├── storage/             # arquivos temporários (não versionados)
│   └── tests/
│
├── .github/                 # modelo de issue
├── .prettierrc.json
└── README.md
```

---

## Documentação Técnica

A documentação complementar está disponível em `frontend/docs/`.

- [Arquitetura](frontend/docs/arquitetura.md): tecnologias, organização das camadas e fluxo dos dados.
- [Componentes](frontend/docs/componentes.md): catálogo de componentes, páginas e services da interface.
- [Requisitos](frontend/docs/requisitos.md): requisitos do projeto, rastreabilidade e situação das entregas.

### API

A API utiliza OpenAPI 3 e Swagger UI.

Com o backend iniciado:

**Documentação:** `http://localhost:3333/api-docs`

**Especificação JSON:** `http://localhost:3333/api-docs.json`

**Health check:** `http://localhost:3333/api/health`

| Recurso | Endpoints |
|---|---|
| Sistema | `GET /api/health`, `GET /api/formats` |
| Autenticação | `POST /api/auth/login`, `POST /api/auth/logout` |
| Usuários | `POST /api/users`, `GET`/`PATCH`/`DELETE /api/users/me` |
| Downloads | `POST /api/downloads/inspect`, `GET /api/downloads/:id/preview`, `POST /api/downloads` |
| Conversões | `POST /api/conversions` |
| Histórico | `GET /api/history`, `GET /api/history/stats`, `DELETE /api/history`, `DELETE /api/history/:id` |
| Arquivos | `GET /api/files/:id` |

---

## Testes

O backend utiliza Node.js Test Runner e Supertest.

```bash
cd backend
npm test
```

Para verificar o build do frontend:

```bash
cd frontend
npm run build
```

Os testes da API utilizam o PostgreSQL e armazenamento temporário, restaurando o histórico local ao final. Eles cobrem o health check e o Swagger, o bloqueio de links locais e privados, conversões reais de imagem, rejeição de arquivos inválidos, limite de upload, downloads, histórico (filtros, paginação, estatísticas e exclusão), expiração e limpeza após reinício.

Testes que dependem do FFmpeg são ignorados quando a ferramenta não está instalada.

As rotas de usuários e autenticação ainda não têm testes automatizados; o CRUD da conta é validado manualmente pela interface e pelo Swagger. O frontend também não possui testes automatizados.

A validação de downloads externos reais ainda depende de testes específicos com URLs públicas. Os testes automatizados existentes utilizam fontes controladas.

---

## Privacidade e Execução Local

O DropZone foi desenvolvido para uso pessoal e não possui uma instância pública hospedada.

- A interface é executada pelo navegador.
- O backend é iniciado no próprio computador.
- Os arquivos convertidos são processados localmente pelo backend.
- O histórico e as contas são armazenados em PostgreSQL.
- Senhas são salvas apenas como hash (scrypt) e a sessão fica em cookie HttpOnly.
- O histórico ainda é compartilhado por todos que usam o mesmo servidor local; ele não é separado por conta.
- Os resultados temporários seguem uma política de retenção e limpeza.
- Downloads por URL exigem conexão com a internet.

O projeto não utiliza armazenamento de arquivos em nuvem.

**Importante:** a publicação do código-fonte no GitHub não significa que o backend esteja preparado ou auditado para ser exposto diretamente à internet.

---

## Possíveis Melhorias Futuras

- **Links compartilhados:** baixar MP4/MP3 de fontes públicas suportadas (#4).
- **Interface minimalista:** aplicar a nova paleta e simplificar o fluxo (#15).
- **Histórico privado:** vincular as operações à conta do usuário (#17).
- **Conversão no navegador:** processar formatos compatíveis diretamente no dispositivo, sem enviar arquivos ao backend.
- **Compatibilidade:** ampliar gradualmente os formatos locais suportados.
- **Testes:** cobrir usuários/autenticação e o frontend, e validar em diferentes navegadores.

O desenvolvimento pode ser acompanhado pelas [Issues do projeto](https://github.com/NicolasHMartinsP/Dropzone/issues).

---
