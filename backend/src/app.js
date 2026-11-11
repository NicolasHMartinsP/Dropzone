import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { env } from './config/env.js';
import { apiRoutes } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { swaggerDocument } from './docs/swagger.js';

// Monta a aplicação Express. Cada requisição passa pelos middlewares abaixo,
// NA ORDEM em que foram registrados, até alguém responder.
export const app = express();
app.disable('x-powered-by'); // não revela que o servidor é Express

// 1. Segurança e acesso
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: { policy: 'cross-origin' },
  }),
);
app.use(cors({ origin: env.clientOrigin }));

// 2. Leitura da requisição: corpo JSON em req.body e cookies em req.cookies
app.use(express.json({ limit: '16kb' }));
app.use(cookieParser());

// 3. Documentação interativa (Swagger) em /api-docs
app.get('/api-docs.json', (_req, res) => res.json(swaggerDocument));
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(swaggerDocument, {
    customSiteTitle: 'DropZone · API',
    swaggerOptions: { persistAuthorization: false },
  }),
);

// 4. Rotas da API (ver routes/index.js)
app.use('/api', apiRoutes);

// 5. Ninguém respondeu: a rota não existe
app.use((_req, res) =>
  res.status(404).json({ error: { code: 'NOT_FOUND', message: 'Rota não encontrada.' } }),
);

// 6. Algum passo lançou erro: transforma em resposta JSON padronizada
app.use(errorHandler);
