import * as usersService from '../services/users.service.js';
import { SESSION_COOKIE } from '../services/auth.service.js';

export async function create(req, res) {
  res.status(201).json(await usersService.createUser(req.body));
}

export function me(req, res) {
  res.json(usersService.toPublicUser(req.user));
}

export async function update(req, res) {
  res.json(await usersService.updateUser(req.user, req.body));
}

export async function remove(req, res) {
  await usersService.deleteUser(req.user);
  res.clearCookie(SESSION_COOKIE, { path: '/' });
  res.status(204).end();
}
