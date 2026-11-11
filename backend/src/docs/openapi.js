const json = (schema) => ({ 'application/json': { schema } });
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const body = (schema) => ({ required: true, content: json(schema) });
const error = {
  description:
    'Dados inválidos, arquivo incompatível, limite excedido ou falha no processamento.',
  content: json(ref('Error')),
};
const idParameter = {
  name: 'id',
  in: 'path',
  required: true,
  schema: { type: 'string', format: 'uuid' },
};

export const openapi = {
  openapi: '3.0.3',
  info: {
    title: 'DropZone API',
    version: '1.0.0',
    description:
      'API acadêmica de downloads por link direto, conversão de imagens/áudio/vídeo e histórico persistido com Sequelize + PostgreSQL. Sem autenticação: uso local e individual. Arquivos gerados expiram; metadados permanecem. Links de páginas, playlists, PDFs e documentos Office não são suportados.',
  },
  servers: [
    { url: '/', description: 'Servidor atual (também funciona pelo proxy Vite)' },
  ],
  tags: [
    { name: 'Sistema' },
    { name: 'Downloads' },
    { name: 'Conversões' },
    { name: 'Histórico' },
    { name: 'Arquivos' },
    { name: 'Usuários' },
  ],
  paths: {
    '/api/downloads/{id}/preview': {
      get: {
        tags: ['Downloads'],
        summary: 'Prévia da mídia já analisada (válida por até 15 minutos)',
        parameters: [idParameter],
        responses: {
          200: {
            description:
              'Arquivo validado, com Content-Type de mídia e Cache-Control no-store.',
          },
          206: { description: 'Trecho do arquivo solicitado por Range.' },
          409: { description: 'Arquivo em processamento.' },
          410: { description: 'Análise inexistente, expirada ou consumida.' },
        },
      },
    },
    '/api/health': {
      get: {
        tags: ['Sistema'],
        operationId: 'health',
        summary: 'Verificar API e disponibilidade de FFmpeg',
        responses: {
          200: {
            description: 'API disponível',
            content: json({
              type: 'object',
              properties: {
                status: { type: 'string', example: 'ok' },
                app: { type: 'string' },
                capabilities: ref('Formats'),
                retentionHours: { type: 'number' },
              },
            }),
          },
        },
      },
    },
    '/api/formats': {
      get: {
        tags: ['Sistema'],
        operationId: 'formats',
        summary: 'Listar formatos habilitados neste servidor',
        responses: {
          200: {
            description:
              'Capacidades reais. Áudio/vídeo ficam vazios se FFmpeg/FFprobe não estiverem instalados.',
            content: json(ref('Formats')),
          },
        },
      },
    },
    '/api/downloads/inspect': {
      post: {
        tags: ['Downloads'],
        operationId: 'inspectDownload',
        summary: 'Analisar e guardar temporariamente uma mídia por link direto',
        description:
          'Faz o download de até 50 MB para analisar o conteúdo. Retorna sourceId válido por 15 minutos. Somente HTTP/HTTPS públicos nas portas padrão; IPs privados e redirecionamentos inseguros são bloqueados. Não cria registro no histórico nesta etapa.',
        requestBody: body({
          type: 'object',
          required: ['url'],
          properties: {
            url: {
              type: 'string',
              format: 'uri',
              example:
                'https://upload.wikimedia.org/wikipedia/commons/3/3f/Fronalpstock_big.jpg',
            },
          },
        }),
        responses: {
          200: { description: 'Arquivo analisado', content: json(ref('Source')) },
          400: error,
          413: error,
          415: error,
          422: error,
          429: error,
          502: error,
          504: error,
        },
      },
    },
    '/api/downloads': {
      post: {
        tags: ['Downloads'],
        operationId: 'createDownload',
        summary: 'Preparar download em um dos formatos disponíveis',
        description:
          'Use sourceId obtido em /downloads/inspect. O sourceId é consumido nesta operação. O resultado fica disponível em downloadUrl. O registro representa o arquivo preparado no servidor, sem afirmar que o navegador o salvou.',
        requestBody: body({
          type: 'object',
          required: ['sourceId', 'format'],
          properties: {
            sourceId: { type: 'string', format: 'uuid' },
            format: {
              type: 'string',
              example: 'original',
              description: 'original ou uma das opções de formats retornadas na análise.',
            },
          },
        }),
        responses: {
          201: {
            description: 'Download preparado e histórico registrado',
            content: json(ref('Job')),
          },
          400: error,
          409: error,
          410: error,
          422: error,
          429: error,
        },
      },
    },
    '/api/conversions': {
      post: {
        tags: ['Conversões'],
        operationId: 'createConversion',
        summary: 'Enviar e converter um arquivo',
        description:
          'Imagens estáticas PNG/JPG/WebP/AVIF até 20 megapixels. Com FFmpeg, áudio/vídeo de até 10 minutos. Entrada até 50 MB; saída até 200 MB. O processamento pode levar até 2 minutos. Envie um arquivo e um formato compatível.',
        requestBody: {
          required: true,
          content: {
            'multipart/form-data': {
              schema: {
                type: 'object',
                required: ['file', 'format'],
                properties: {
                  file: { type: 'string', format: 'binary' },
                  format: {
                    type: 'string',
                    enum: [
                      'png',
                      'jpg',
                      'webp',
                      'avif',
                      'mp3',
                      'wav',
                      'ogg',
                      'mp4',
                      'webm',
                    ],
                  },
                },
              },
            },
          },
        },
        responses: {
          201: {
            description: 'Conversão concluída e registrada',
            content: json(ref('Job')),
          },
          400: error,
          413: error,
          415: error,
          422: error,
          429: error,
          503: error,
        },
      },
    },
    '/api/history': {
      get: {
        tags: ['Histórico'],
        operationId: 'listHistory',
        summary: 'Consultar histórico com busca, filtros e paginação',
        parameters: [
          {
            name: 'kind',
            in: 'query',
            schema: { type: 'string', enum: ['download', 'conversion'] },
          },
          {
            name: 'status',
            in: 'query',
            schema: { type: 'string', enum: ['processing', 'completed', 'failed'] },
          },
          { name: 'q', in: 'query', schema: { type: 'string', maxLength: 100 } },
          {
            name: 'page',
            in: 'query',
            schema: { type: 'integer', minimum: 1, default: 1 },
          },
          {
            name: 'limit',
            in: 'query',
            schema: { type: 'integer', minimum: 1, maximum: 50, default: 10 },
          },
        ],
        responses: {
          200: {
            description: 'Histórico paginado',
            content: json({
              type: 'object',
              properties: {
                items: { type: 'array', items: ref('Job') },
                total: { type: 'integer' },
                page: { type: 'integer' },
                pages: { type: 'integer' },
              },
            }),
          },
          400: error,
        },
      },
      delete: {
        tags: ['Histórico'],
        operationId: 'clearHistory',
        summary: 'Excluir todo o histórico e os arquivos gerados',
        responses: { 204: { description: 'Histórico e arquivos removidos' }, 409: error },
      },
    },
    '/api/history/stats': {
      get: {
        tags: ['Histórico'],
        operationId: 'historyStats',
        summary: 'Consultar totais do histórico',
        responses: {
          200: {
            description: 'Estatísticas reais do banco',
            content: json({
              type: 'object',
              properties: Object.fromEntries(
                [
                  'total',
                  'downloads',
                  'conversions',
                  'completed',
                  'failed',
                  'processing',
                  'totalBytes',
                ].map((key) => [key, { type: 'integer', minimum: 0 }]),
              ),
            }),
          },
        },
      },
    },
    '/api/history/{id}': {
      delete: {
        tags: ['Histórico'],
        operationId: 'deleteHistoryJob',
        summary: 'Excluir um registro e seu arquivo',
        parameters: [idParameter],
        responses: { 204: { description: 'Registro removido' }, 404: error, 409: error },
      },
    },
    '/api/users': {
      post: {
        tags: ['Usuários'],
        operationId: 'createUser',
        summary: 'Cadastrar um novo usuário',
        requestBody: body({
          type: 'object',
          required: ['name', 'email', 'password'],
          properties: {
            name: { type: 'string', minLength: 1, maxLength: 20, example: 'Nico' },
            email: {
              type: 'string',
              format: 'email',
              maxLength: 70,
              example: 'nico@teste.com',
            },
            password: {
              type: 'string',
              format: 'password',
              minLength: 8,
              maxLength: 128,
              example: 'senha12345',
            },
          },
        }),
        responses: {
          201: {
            description: 'Usuário criado (sem a senha)',
            content: json(ref('User')),
          },
          400: error,
          409: error,
          429: error,
        },
      },
    },
    '/api/files/{id}': {
      get: {
        tags: ['Arquivos'],
        operationId: 'downloadFile',
        summary: 'Baixar o arquivo gerado',
        parameters: [idParameter],
        responses: {
          200: {
            description: 'Arquivo binário com Content-Disposition: attachment',
            content: {
              'application/octet-stream': {
                schema: { type: 'string', format: 'binary' },
              },
            },
          },
          404: error,
          410: error,
        },
      },
    },
  },
  components: {
    schemas: {
      Error: {
        type: 'object',
        properties: {
          error: {
            type: 'object',
            properties: { code: { type: 'string' }, message: { type: 'string' } },
            required: ['code', 'message'],
          },
        },
        required: ['error'],
      },
      User: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          name: { type: 'string' },
          email: { type: 'string', format: 'email' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
      Formats: {
        type: 'object',
        properties: {
          images: {
            type: 'array',
            items: { type: 'string' },
            example: ['png', 'jpg', 'webp', 'avif'],
          },
          audio: { type: 'array', items: { type: 'string' } },
          video: { type: 'array', items: { type: 'string' } },
          ffmpeg: { type: 'boolean' },
          maxFileSizeMB: { type: 'number', example: 50 },
          maxMediaDurationSeconds: { type: 'integer', example: 600 },
        },
      },
      Source: {
        type: 'object',
        properties: {
          sourceId: { type: 'string', format: 'uuid' },
          previewUrl: {
            type: 'string',
            description: 'URL relativa da prévia; expira junto com a análise.',
          },
          fileName: { type: 'string' },
          sizeBytes: { type: 'integer' },
          kind: { type: 'string', enum: ['image', 'audio', 'video'] },
          format: { type: 'string' },
          formats: { type: 'array', items: { type: 'string' } },
          expiresAt: { type: 'string', format: 'date-time' },
          width: { type: 'integer' },
          height: { type: 'integer' },
          duration: { type: 'number' },
        },
      },
      Job: {
        type: 'object',
        properties: {
          id: { type: 'string', format: 'uuid' },
          kind: { type: 'string', enum: ['download', 'conversion'] },
          status: { type: 'string', enum: ['processing', 'completed', 'failed'] },
          inputName: { type: 'string' },
          outputName: { type: 'string', nullable: true },
          inputFormat: { type: 'string' },
          outputFormat: { type: 'string' },
          mimeType: { type: 'string', nullable: true },
          sizeBytes: { type: 'integer' },
          errorMessage: { type: 'string', nullable: true },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
          completedAt: { type: 'string', format: 'date-time', nullable: true },
          expiresAt: { type: 'string', format: 'date-time', nullable: true },
          downloadable: { type: 'boolean' },
          downloadUrl: {
            type: 'string',
            nullable: true,
            example: '/api/files/00000000-0000-4000-8000-000000000000',
          },
        },
      },
    },
  },
};
