import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { processingLimit } from '../middlewares/rateLimits.js';

// Rotas de usuários (prefixo /api/users):
//   POST /api/users     → cadastrar um novo usuário (Create)
//   GET  /api/users/me  → dados do usuário logado (Read) — exige login
export const usersRoutes = Router();

usersRoutes.post('/', processingLimit, usersController.create);
usersRoutes.get('/me', requireAuth, usersController.me);
