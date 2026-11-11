import { Router } from 'express';
import * as historyController from '../controllers/history.controller.js';

// Rotas do histórico de operações (prefixo /api/history):
//   GET    /api/history        → lista com filtros e paginação
//   GET    /api/history/stats  → totais por tipo e situação
//   DELETE /api/history        → apaga todo o histórico
//   DELETE /api/history/:id    → apaga um registro
export const historyRoutes = Router();

historyRoutes.get('/', historyController.list);
historyRoutes.get('/stats', historyController.stats);
historyRoutes.delete('/', historyController.clear);
historyRoutes.delete('/:id', historyController.remove);
