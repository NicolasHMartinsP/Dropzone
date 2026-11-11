import { Router } from 'express';
import * as downloadsController from '../controllers/download.controller.js';
import { processingLimit } from '../middlewares/rateLimits.js';

// Rotas de download por link (prefixo /api/downloads):
//   POST /api/downloads/inspect      → baixa e analisa o link (passo 1)
//   GET  /api/downloads/:id/preview  → prévia do arquivo analisado
//   POST /api/downloads              → prepara o arquivo no formato escolhido (passo 2)
export const downloadsRoutes = Router();

downloadsRoutes.post('/inspect', processingLimit, downloadsController.inspect);
downloadsRoutes.get('/:id/preview', downloadsController.preview);
downloadsRoutes.post('/', processingLimit, downloadsController.create);
