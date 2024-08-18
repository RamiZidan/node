"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class UserIDImage extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  UserIDImage.init(
    {
      image_frontSide: DataTypes.TEXT,
      image_backSide: DataTypes.TEXT,
      fullName: DataTypes.STRING,
      nationalNumber: DataTypes.INTEGER,
      reqStatus: DataTypes.ENUM("pending", "approved", "rejected"),
    },
    {
      sequelize,
      modelName: "CertificateOrders",
    }
  );
  return UserIDImage;
};
