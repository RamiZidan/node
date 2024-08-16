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
      admin_id: {
        type: Sequelize.INTEGER,
        references: {
          model: {
            tableName: "Admins",
          },
          key: "id",
        },
        allowNull: false,
        onDelete: "CASCADE",
      },
      version: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      serialNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      signatureAlgorithm: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      issuer: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      validatePeriod: {
        type: Sequelize.DATE,
        allowNull: false,
      },
      subject: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      organization: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      ca_signature: {
        type: Sequelize.TEXT,
        allowNull: false,
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
