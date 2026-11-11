import * as usersService from '../services/users.service.js';

// Cadastra um usuário e devolve 201 (Created) sem o hash da senha.
export async function create(req, res) {
  res.status(201).json(await usersService.createUser(req.body));
}

// Devolve o usuário logado. Quem coloca req.user é o middleware requireAuth.
export function me(req, res) {
  res.json(usersService.toPublicUser(req.user));
}
