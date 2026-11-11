import { DataTypes } from 'sequelize';
export const name = '002-create-users-and-sessions';

export async function up(queryInterface, transaction) {
  await queryInterface.createTable(
    'users',
    {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      name: { type: DataTypes.STRING(20), allowNull: false },
      email: { type: DataTypes.STRING(70), allowNull: false, unique: true },
      passwordHash: { type: DataTypes.STRING(200), allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { transaction },
  );
  await queryInterface.createTable(
    'sessions',
    {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      userId: {
        type: DataTypes.UUID,
        allowNull: false,
        references: { model: 'users', key: 'id' },
        onDelete: 'CASCADE',
      },
      tokenHash: { type: DataTypes.STRING(64), allowNull: false, unique: true },
      expiresAt: { type: DataTypes.DATE, allowNull: false },
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { transaction },
  );
  // Índice
  await queryInterface.addIndex('sessions', ['userId'], { transaction });
}
