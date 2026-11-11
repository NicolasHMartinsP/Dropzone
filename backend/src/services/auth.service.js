import { randomBytes, createHash } from 'node:crypto';
import { Op } from 'sequelize';
import { Session, User } from '../models/index.js';
import { AppError } from '../shared/AppError.js';
import { verifyPassword } from '../shared/password.js';

export const SESSION_COOKIE = 'dz_session';
const SESSION_MS = 7 * 24 * 60 * 60 * 1000; // 7 dias

export const cookieOptions = {
  httpOnly: true,
  sameSite: 'lax',
  secure: process.env.NODE_ENV === 'production',
  maxAge: SESSION_MS,
  path: '/',
};

const hashToken = (token) => createHash('sha256').update(token).digest('hex');

export async function login({ email, password } = {}) {
  const cleanEmail = typeof email === 'string' ? email.trim().toLowerCase() : '';
  const user = await User.findOne({ where: { email: cleanEmail } });
  const valid =
    user &&
    typeof password === 'string' &&
    (await verifyPassword(password, user.passwordHash));

  if (!valid)
    throw new AppError(401, 'E-mail ou senha incorretos.', 'INVALID_CREDENTIALS');
  return user;
}

export async function createSession(userId) {
  const token = randomBytes(32).toString('hex');
  await Session.create({
    userId,
    tokenHash: hashToken(token),
    expiresAt: new Date(Date.now() + SESSION_MS),
  });
  return token;
}

export async function findUserBySession(token) {
  if (typeof token !== 'string' || !token) return null;
  const session = await Session.findOne({
    where: { tokenHash: hashToken(token), expiresAt: { [Op.gt]: new Date() } },
    include: User,
  });
  if (!session) return null;
  session.expiresAt = new Date(Date.now() + SESSION_MS);
  await session.save();
  return session.User;
}

export async function deleteSession(token) {
  if (typeof token === 'string' && token)
    await Session.destroy({ where: { tokenHash: hashToken(token) } });
}
