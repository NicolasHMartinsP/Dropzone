import { DataTypes } from 'sequelize';

export const name = '001-create-jobs';
export async function up(queryInterface, transaction) {
  await queryInterface.createTable(
    'jobs',
    {
      id: { type: DataTypes.UUID, primaryKey: true, allowNull: false },
      kind: { type: DataTypes.STRING, allowNull: false },
      status: { type: DataTypes.STRING, allowNull: false },
      inputName: { type: DataTypes.STRING, allowNull: false },
      outputName: DataTypes.STRING,
      inputFormat: DataTypes.STRING,
      outputFormat: DataTypes.STRING,
      sourceUrl: DataTypes.TEXT,
      filePath: DataTypes.TEXT,
      mimeType: DataTypes.STRING,
      sizeBytes: { type: DataTypes.BIGINT, allowNull: false, defaultValue: 0 },
      errorMessage: DataTypes.TEXT,
      completedAt: DataTypes.DATE,
      expiresAt: DataTypes.DATE,
      createdAt: { type: DataTypes.DATE, allowNull: false },
      updatedAt: { type: DataTypes.DATE, allowNull: false },
    },
    { transaction },
  );
  await queryInterface.addIndex('jobs', ['kind', 'createdAt'], { transaction });
  await queryInterface.addIndex('jobs', ['status'], { transaction });
}
