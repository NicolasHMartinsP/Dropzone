import * as auth from '../services/auth.service.js';
import { toPublicUser } from '../services/users.service.js';

export async function login(req, res) {
  const user = await auth.login(req.body);
  const token = await auth.createSession(user.id);
  res.cookie(auth.SESSION_COOKIE, token, auth.cookieOptions);
  res.json(toPublicUser(user));
}

export async function logout(req, res) {
  await auth.deleteSession(req.cookies[auth.SESSION_COOKIE]);
  res.clearCookie(auth.SESSION_COOKIE, { path: '/' });
  res.status(204).end();
}
