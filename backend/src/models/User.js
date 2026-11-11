import { DataTypes } from 'sequelize';
import { sequelize } from '../config/database.js';

export const User = sequelize.define(
  'User',
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: {
      type: DataTypes.STRING(20),
      allowNull: false,
      validate: {
        len: { args: [1, 20], msg: 'O nome deve ter de 1 a 20 caracteres.' },
      },
    },
    email: {
      type: DataTypes.STRING(70),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: { msg: 'Informe um e-mail válido.' },
        len: { args: [3, 70], msg: 'O e-mail deve ter até 70 caracteres.' },
      },
    },
    passwordHash: { type: DataTypes.STRING(200), allowNull: false },
  },
  { tableName: 'users' },
);
