"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("CertificateOrders", {
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
      image_frontSide: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      fullName: {
        type:  Sequelize.TEXT,
        allowNull: false,
      },
      nationalNumber: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      // fingerPrint: {
      //   type: Sequelize.INTEGER,
      //   allowNull: false,
      // },
      image_backSide: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      liveImage: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      reqStatus: {
        type: Sequelize.ENUM("pending", "processing", "approved", "rejected"),
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
    await queryInterface.dropTable("CertificateOrders");
  },
};
