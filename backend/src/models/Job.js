import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const Job = sequelize.define(
  'Job',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    kind: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isIn: [['download', 'conversion']] },
    },
    favorite: { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'processing',
      validate: { isIn: [['processing', 'completed', 'failed']] },
    },
    inputName: { type: DataTypes.STRING, allowNull: false },
    outputName: DataTypes.STRING,
    inputFormat: DataTypes.STRING,
    outputFormat: DataTypes.STRING,
    sourceUrl: DataTypes.TEXT,
    filePath: DataTypes.TEXT,
    mimeType: DataTypes.STRING,
    sizeBytes: { type: DataTypes.BIGINT, defaultValue: 0, allowNull: false },
    errorMessage: DataTypes.TEXT,
    completedAt: DataTypes.DATE,
    expiresAt: DataTypes.DATE,
  },
  {
    tableName: 'jobs',
    indexes: [{ fields: ['kind', 'createdAt'] }, { fields: ['status'] }],
  },
);
