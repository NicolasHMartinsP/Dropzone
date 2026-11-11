import * as users from '../services/users.service.js';

export async function create(req, res) {
  res.status(201).json(await users.createUser(req.body));
}
