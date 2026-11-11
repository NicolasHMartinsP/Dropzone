import { User } from '../models/index.js';
import { AppError } from '../shared/AppError.js';
import { hashPassword, verifyPassword } from '../shared/password.js';

export function toPublicUser(user) {
  const { id, name, email, createdAt, updatedAt } = user;
  return { id, name, email, createdAt, updatedAt };
}

const text = (value) => (typeof value === 'string' ? value.trim() : '');

function validatePassword(password) {
  if (typeof password !== 'string' || password.length < 8 || password.length > 128)
    throw new AppError(
      400,
      'A senha precisa ter entre 8 e 128 caracteres.',
      'INVALID_PASSWORD',
    );
}
export async function createUser({ name, email, password } = {}) {
  validatePassword(password);

  const user = await User.create({
    name: text(name),
    email: text(email).toLowerCase(),
    passwordHash: await hashPassword(password),
  });
  return toPublicUser(user);
}

export async function updateUser(user, { name, email, password, currentPassword } = {}) {
  const changes = {};
  if (name !== undefined) changes.name = text(name);
  if (email !== undefined) changes.email = text(email).toLowerCase();
  if (password !== undefined) {
    validatePassword(password);
    const currentIsCorrect =
      typeof currentPassword === 'string' &&
      (await verifyPassword(currentPassword, user.passwordHash));
    if (!currentIsCorrect)
      throw new AppError(400, 'A senha atual está incorreta.', 'WRONG_PASSWORD');
    changes.passwordHash = await hashPassword(password);
  }
  if (Object.keys(changes).length === 0)
    throw new AppError(400, 'Envie ao menos um campo para alterar.', 'NOTHING_TO_UPDATE');

  await user.update(changes);
  return toPublicUser(user);
}

export async function deleteUser(user) {
  await user.destroy();
}
