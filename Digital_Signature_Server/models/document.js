"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class Document extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      Document.belongsToMany(models.User, {
        through: models.VariousParties,
        foreignKey: "document_id",
      });
    }
  }
  Document.init(
    {
      documentName: DataTypes.STRING,
      document: DataTypes.TEXT,
      // fileType: DataTypes.ENUM(
      //   "pdf",
      //   "docs",
      //   "txt",
      //   "png",
      //   "jpg",
      //   "jpeg",
      //   "tiff"
      // ),
      documentStatus: DataTypes.ENUM("processing", "completed", "rejected"),
      counter: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "Document",
    }
  );
  return Document;
};
