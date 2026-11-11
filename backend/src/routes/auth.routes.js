import { Router } from 'express';
import * as authController from '../controllers/auth.controller.js';
import { loginLimit } from '../middlewares/rateLimits.js';

// Rotas de autenticação (prefixo /api/auth):
//   POST /api/auth/login   → entrar: cria a sessão e envia o cookie
//   POST /api/auth/logout  → sair: apaga a sessão e o cookie
export const authRoutes = Router();

authRoutes.post('/login', loginLimit, authController.login);
authRoutes.post('/logout', authController.logout);
