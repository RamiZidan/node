"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class RealEstatePortalRequest extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
      RealEstatePortalRequest.belongsTo(models.User, { foreignKey: "user_id" });
    }
  }
  RealEstatePortalRequest.init(
    {
      reqName: DataTypes.STRING,
      taboImage: DataTypes.TEXT,
      message: DataTypes.TEXT,
      reqStatus: DataTypes.ENUM("pending", "published", "approved", "rejected"),
      admin_id: DataTypes.INTEGER,
      governmentOfficial_id: DataTypes.INTEGER,
    },
    {
      sequelize,
      modelName: "RealEstatePortalRequest",
    }
  );
  return RealEstatePortalRequest;
};
