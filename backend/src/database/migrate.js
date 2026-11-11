import { pathToFileURL } from 'node:url';
import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';
import * as initial from './migrations/001-create-jobs.js';
import * as createUsersAndSessions from './migrations/002-create-users-and-sessions.js';

export async function migrate() {
  await sequelize.authenticate();
  const meta = sequelize.define(
    'Migration',
    { name: { type: DataTypes.STRING, primaryKey: true } },
    { tableName: 'SequelizeMeta', timestamps: false },
  );
  await meta.sync();
  for (const migration of [initial, createUsersAndSessions]) {
    if (await meta.findByPk(migration.name)) continue;
    await sequelize.transaction(async (transaction) => {
      await migration.up(sequelize.getQueryInterface(), transaction);
      await meta.create({ name: migration.name }, { transaction });
    });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await migrate();
    console.log('Migrações aplicadas.');
  } finally {
    await sequelize.close();
  }
}
