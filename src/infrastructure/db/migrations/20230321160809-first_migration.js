'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('participants', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      company_name: Sequelize.STRING,
      email: { type: Sequelize.STRING, unique: true },
      role: Sequelize.STRING,
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });

    await queryInterface.createTable('participant_connection', {
      id: {
        type: Sequelize.STRING,
        primaryKey: true,
      },
      participant_id_1: {
        type: Sequelize.STRING,
        allowNull: false,
        onDelete: 'restrict',
        onUpdate: 'cascade',
        references: {
          model: 'participants',
          key: 'id',
        },
      },
      participant_id_2: {
        type: Sequelize.STRING,
        allowNull: false,
        onDelete: 'restrict',
        onUpdate: 'cascade',
        references: {
          model: 'participants',
          key: 'id',
        },
      },
      created_at: Sequelize.DATE,
      updated_at: Sequelize.DATE,
    });
  },

  down: async (queryInterface) => {
    await queryInterface.dropTable('participant_connection');
    await queryInterface.dropTable('participants');
  },
};
