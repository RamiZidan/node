"use strict";
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("Documents", {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
      },
      documentName: {
        type:  Sequelize.TEXT,
        allowNull: false,
      },
      document: {
        type: Sequelize.TEXT,
        allowNull: false,
      },
      // fileType: {
      //   type: Sequelize.ENUM(
      //     "pdf",
      //     "docs",
      //     "txt",
      //     "png",
      //     "jpg",
      //     "jpeg",
      //     "tiff"
      //   ),
      // },
      documentStatus: {
        type: Sequelize.ENUM("processing", "completed", "rejected"),
      },
      counter: {
        type: Sequelize.INTEGER,
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
    await queryInterface.dropTable("Documents");
  },
};
