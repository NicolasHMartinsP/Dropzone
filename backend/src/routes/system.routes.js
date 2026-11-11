import { Router } from 'express';
import * as systemController from '../controllers/system.controller.js';

// Rotas de sistema (sem prefixo próprio):
//   GET /api/health   → a API está no ar? quais formatos ela converte?
//   GET /api/formats  → lista de formatos disponíveis
export const systemRoutes = Router();

systemRoutes.get('/health', systemController.health);
systemRoutes.get('/formats', systemController.formats);
