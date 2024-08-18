"use strict";

const { sequelize } = require("../../models");

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("RealEstatePortalRequests", {
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
        // references: {
        //   model: {
        //     tableName: "Admins",
        //   },
        //   key: "id",
        // },
        // allowNull: false,
        // onDelete: "CASCADE",
      },
      governmentOfficial_id: {
        type: Sequelize.INTEGER,
        // references: {
        //   model: {
        //     tableName: "Admins",
        //   },
        //   key: "id",
        // },
        // allowNull: false,
        // onDelete: "CASCADE",
      },
      reqName: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      taboImage: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      message: {
        type: Sequelize.TEXT,
      },
      reqStatus: {
        type: Sequelize.ENUM("pending", "published", "approved", "rejected"),
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
    await queryInterface.dropTable("RealEstatePortalRequests");
  },
};
