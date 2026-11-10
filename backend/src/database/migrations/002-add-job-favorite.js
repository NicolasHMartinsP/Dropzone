import { DataTypes } from 'sequelize';

export const name = '002-add-job-favorite';
export async function up(queryInterface, transaction) {
  await queryInterface.addColumn(
    'jobs',
    'favorite',
    {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    { transaction },
  );
  await queryInterface.addIndex('jobs', ['favorite'], { transaction });
}
