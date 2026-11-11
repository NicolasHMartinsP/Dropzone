import { Router } from 'express';
import * as conversionsController from '../controllers/conversion.controller.js';
import { processingLimit } from '../middlewares/rateLimits.js';
import { upload } from '../middlewares/upload.js';

// Rotas de conversão (prefixo /api/conversions):
//   POST /api/conversions  → recebe um arquivo (campo "file") e o formato desejado
//
// Ordem dos middlewares: limita requisições → salva o upload no disco → converte.
export const conversionsRoutes = Router();

conversionsRoutes.post(
  '/',
  processingLimit,
  upload.single('file'),
  conversionsController.create,
);
