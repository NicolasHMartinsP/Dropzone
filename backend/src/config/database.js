import { Sequelize } from 'sequelize';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { env } from './env.js';

if (env.dbStorage !== ':memory:')
  await mkdir(path.dirname(env.dbStorage), { recursive: true });
export const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: env.dbStorage,
  logging: false,
});
