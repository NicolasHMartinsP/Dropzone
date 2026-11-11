import {
  SESSION_COOKIE,
  cookieOptions,
  findUserBySession,
} from '../services/auth.service.js';
import { AppError } from '../shared/AppError.js';

export async function requireAuth(req, res, next) {
  const token = req.cookies[SESSION_COOKIE];
  const user = await findUserBySession(token);
  if (!user)
    throw new AppError(401, 'Entre na sua conta para continuar.', 'UNAUTHENTICATED');
  req.user = user;
  res.cookie(SESSION_COOKIE, token, cookieOptions);
  next();
}
