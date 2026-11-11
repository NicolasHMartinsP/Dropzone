import { Router } from 'express';
import * as usersController from '../controllers/users.controller.js';
import { requireAuth } from '../middlewares/auth.js';
import { processingLimit } from '../middlewares/rateLimits.js';

// Rotas de usuários (prefixo /api/users):
//   POST /api/users     -> cadastrar um novo usuário (Create)
//   GET  /api/users/me  -> dados do usuário logado (Read)
//   PATCH /api/users/me  -> alterar nome, e-mail e senha (update)
// DELETE /api/users/me -> excluir a própria conta (Delete)
export const usersRoutes = Router();

usersRoutes.post('/', processingLimit, usersController.create);
usersRoutes.get('/me', requireAuth, usersController.me);
usersRoutes.patch('/me', requireAuth, usersController.update);
usersRoutes.delete('/me', requireAuth, usersController.remove);
