import { Router } from 'express';
import * as historyController from '../controllers/history.controller.js';

// Rotas de arquivos gerados (prefixo /api/files):
//   GET /api/files/:id  → baixa o arquivo de um registro do histórico
export const filesRoutes = Router();

filesRoutes.get('/:id', historyController.file);
