import { User } from '../models/index.js';
import { AppError } from '../shared/AppError.js';
import { hashPassword } from '../shared/password.js';

export function toPublicUser(user) {
  const { id, name, email, createdAt, updatedAt } = user;
  return { id, name, email, createdAt, updatedAt };
}

const text = (value) => (typeof value === 'string' ? value.trim() : '');

export async function createUser({ name, email, password } = {}) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128)
    throw new AppError(
      400,
      'A senha precisa ter entre 8 e 128 caracteres.',
      'INVALID_PASSWORD',
    );

  const user = await User.create({
    name: text(name),
    passwordHash: await hashPassword(password),
  });
  return toPublicUser(user);
}
