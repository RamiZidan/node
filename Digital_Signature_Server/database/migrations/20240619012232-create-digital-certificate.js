"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("DigitalCertificates", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      user_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "Users",
          },
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
      },

      version: {
        type: Sequelize.TEXT,
        allowNull: true,
      },
      serialNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      signatureAlgorithm: {
        type:  Sequelize.TEXT,
        allowNull: false,
      },
      issuer: {
        type:  Sequelize.TEXT,
        allowNull: true,
      },
      validatePeriod: {
        type: Sequelize.DATE,
        allowNull: true,
      },
      subject: {
        type:  Sequelize.TEXT,
        allowNull: true,
      },
      organization: {
        type:  Sequelize.TEXT,
        allowNull: true,
      },

      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
      },
    });
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("DigitalCertificates");
  },
};
