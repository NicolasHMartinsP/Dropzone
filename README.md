# DropZone

## Prioridades aprovadas (2026-11-03)

1. Persistência com **PostgreSQL + Sequelize**, requisito obrigatório da faculdade (#12).
2. Baixar **MP4/MP3 por links compartilhados** de fontes públicas suportadas, além dos links diretos (#4).
3. Validar conversões de imagens PNG/JPG/WebP, áudio MP3/WAV/OGG, vídeo MP4/WebM e extração MP4 → MP3 (#14).
4. Simplificar a interface: #171219, #355834 e #D33F49, texto neutro legível, grão discreto, espaçamento consistente e animações curtas (#15).
5. Conta e histórico privado de metadados ficam depois das ferramentas públicas (#13, #16 e #17).

**Situação real:** o código usa PostgreSQL + Sequelize, aceita links diretos e converte no backend local com Sharp/FFmpeg. Links compartilhados são trabalho pendente.
Para entregar áudio/vídeo sem duplicar motores, o backend existente será reaproveitado. Conversão no navegador fica como melhoria posterior.
O adaptador de compartilhamento deve avaliar yt-dlp; suporte por fonte precisa ser testado e datado, sem promessa de compatibilidade universal.
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

O **DropZone** foi desenvolvido para centralizar essas operações em uma interface web simples, permitindo selecionar arquivos, escolher formatos compatíveis e salvar os resultados diretamente no computador.

A aplicação é executada localmente, sem depender de hospedagem ou serviços de conversão em nuvem.

**O projeto está em desenvolvimento**, com foco em simplicidade, manutenção e processamento eficiente de arquivos.

---

## Tecnologias

### Frontend

- **React 19:** construção da interface baseada em componentes.
- **Vite:** ambiente de desenvolvimento e build.
- **JavaScript:** lógica da aplicação.
- **React Router DOM:** navegação entre páginas.
- **CSS Modules:** isolamento e organização dos estilos.

### Backend

- **Node.js:** ambiente de execução JavaScript.
- **Express 5:** implementação da API REST.
- **PostgreSQL + Sequelize:** banco de dados relacional e ORM para persistência de dados.
- **Sharp:** processamento e conversão de imagens.
- **FFmpeg / FFprobe:** conversão e análise de áudio e vídeo.
- **Multer:** recebimento e validação inicial de uploads.
- **Helmet / express-rate-limit:** proteções HTTP e controle de requisições.
- **Swagger / OpenAPI:** documentação interativa da API.

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
       Pages / UI            API REST
            |                   |
            v                   v
         Services           Controllers
                                |
                                v
                             Services
                                |
                   +------------+------------+
                   |            |            |
                   v            v            v
                Downloads    Conversões    Histórico
                   |            |            |
                   |       Sharp / FFmpeg   Sequelize
                   |            |            |
                   |            |          PostgreSQL
                   |            |
                   +------+-----+
                          |
                          v
                  Arquivos temporários
                          |
                          v
                  Download do resultado
```

### Organização

O backend segue uma organização baseada em **MVC com Services**, mantendo responsabilidades separadas:

- **Routes:** definição dos endpoints e middlewares.
- **Controllers:** recebimento das requisições e construção das respostas.
- **Services:** processamento e regras de negócio.
- **Models:** representação e persistência dos dados.
- **Middlewares:** validações e tratamento de requisições.
- **Shared:** utilitários e estruturas compartilhadas.

Essa separação facilita manutenção, testes e implementação de novas funcionalidades.

---

## Funcionalidades

### Downloads por URL

Permite analisar e baixar arquivos de mídia disponíveis em URLs públicas HTTP/HTTPS.

- Validação de URLs.
- Identificação de formatos compatíveis.
- Verificação do conteúdo recebido.
- Preparação de arquivos para download.
- Tratamento de erros e endereços incompatíveis.
- Controle de tamanho e duração das requisições.

**Limitação:** atualmente, a aplicação trabalha com links diretos de mídia. Páginas de plataformas como YouTube e Instagram, playlists HLS/DASH e conteúdos protegidos por DRM não são suportados.

### Conversão de arquivos

Permite selecionar ou arrastar arquivos e convertê-los para formatos compatíveis.

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
- Extração de áudio de vídeos compatíveis.

A conversão de imagens utiliza Sharp, enquanto áudio e vídeo dependem do FFmpeg.

Atualmente, o processamento ocorre no backend local. A migração para conversões executadas diretamente no navegador está planejada para versões futuras.
## Fluxo de Funcionamento

### Download

1. O usuário informa a URL de uma mídia pública.
2. O backend valida o endereço e verifica o conteúdo.
3. O sistema identifica os formatos compatíveis.
4. O usuário solicita a preparação do arquivo.
5. O resultado é disponibilizado para salvar no computador.

### Conversão

1. O usuário seleciona ou arrasta um arquivo.
2. A aplicação verifica o formato e o tamanho.
3. O usuário escolhe um formato de saída compatível.
4. O backend processa o arquivo utilizando Sharp ou FFmpeg.
5. O resultado é disponibilizado para download.
6. A operação é registrada no histórico local.

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
- **Retenção dos resultados:** 24 horas, por padrão.

Os limites podem ser ajustados conforme as configurações do ambiente.

Arquivos temporários são removidos por uma rotina de limpeza. Os registros do histórico permanecem até exclusão manual.

---

## Como Rodar o Projeto

### Pré-requisitos

- Node.js 22.12 ou superior.
- PostgreSQL em execução (configurado via `DATABASE_URL`).
- npm.
- Git.
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
npm ci
npm run dev
```

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

Os dois processos precisam permanecer ativos para utilizar a versão atual da aplicação.

### Configuração

Os arquivos `.env.example` do frontend e backend apresentam as configurações disponíveis.

É possível ajustar:

- Porta da API.
- Origem permitida no CORS.
- URL de conexão com o PostgreSQL (`DATABASE_URL`).
- Local de armazenamento de arquivos temporários.
- Limite de tamanho dos arquivos.
- Tempo de retenção.
- Caminhos do FFmpeg e FFprobe.

**Não versione arquivos `.env`, credenciais, bancos locais ou arquivos temporários.**

---

## Estrutura do Projeto

```text
Dropzone/
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── contexts/
│   │   ├── hooks/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── styles/
│   │   └── utils/
│   └── docs/
│
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── database/
│   │   ├── docs/
│   │   ├── middlewares/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   └── shared/
│   ├── storage/
│   └── tests/
│
├── .github/
├── CONTRIBUTING.md
└── README.md
```

---

## Documentação Técnica

A documentação complementar está disponível em `frontend/docs/`.

- [Arquitetura](frontend/docs/arquitetura.md): organização das camadas e fluxo dos dados.
- [Componentes](frontend/docs/componentes.md): catálogo de componentes da interface.
- [Requisitos](frontend/docs/requisitos.md): rastreabilidade das funcionalidades.
- [Testes](frontend/docs/testes.md): procedimentos de validação.
- [Manutenção](frontend/docs/manutencao.md): orientações para evolução do projeto.

### API

A API utiliza OpenAPI e Swagger UI.

Com o backend iniciado:

**Documentação:** `http://localhost:3333/api-docs`

**Health check:** `http://localhost:3333/api/health`

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

Os testes da API utilizam o PostgreSQL e armazenamento temporário, restaurando o histórico local do usuário ao final.

Testes que dependem do FFmpeg podem ser ignorados quando a ferramenta não está instalada.

A validação de downloads externos reais ainda depende de testes específicos com URLs públicas. Os testes automatizados existentes utilizam fontes controladas.

---

## Privacidade e Execução Local

O DropZone foi desenvolvido para uso pessoal e não possui uma instância pública hospedada.

- A interface é executada pelo navegador.
- O backend é iniciado no próprio computador.
- Os arquivos convertidos são processados localmente pelo backend.
- O histórico é armazenado em PostgreSQL.
- Os resultados temporários seguem uma política de retenção e limpeza.
- Downloads por URL exigem conexão com a internet.

O projeto não utiliza armazenamento de arquivos em nuvem.

**Importante:** a publicação do código-fonte no GitHub não significa que o backend esteja preparado ou auditado para ser exposto diretamente à internet.

---

## Possíveis Melhorias Futuras

- **Conversão no navegador:** processar formatos compatíveis diretamente no dispositivo, sem enviar arquivos ao backend.
- **Interface:** simplificar o fluxo de conversão e melhorar a experiência de uso.
- **Compatibilidade:** ampliar gradualmente os formatos locais suportados.
- **Histórico opcional:** permitir contas para sincronizar metadados das operações, sem armazenar os arquivos convertidos na nuvem.
- **Testes:** expandir a cobertura automatizada e a validação em diferentes navegadores.

O desenvolvimento pode ser acompanhado pelas [Issues do projeto](https://github.com/NicolasHMartinsP/Dropzone/issues).

---
