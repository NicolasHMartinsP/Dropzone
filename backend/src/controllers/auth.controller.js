import * as authService from '../services/auth.service.js';
import { toPublicUser } from '../services/users.service.js';

// Confere e-mail e senha, cria a sessão e envia o cookie para o navegador.
export async function login(req, res) {
  const user = await authService.login(req.body);
  const token = await authService.createSession(user.id);
  res.cookie(authService.SESSION_COOKIE, token, authService.cookieOptions);
  res.json(toPublicUser(user));
}

// Apaga a sessão no banco e remove o cookie do navegador.
export async function logout(req, res) {
  await authService.deleteSession(req.cookies[authService.SESSION_COOKIE]);
  res.clearCookie(authService.SESSION_COOKIE, { path: '/' });
  res.status(204).end();
}
