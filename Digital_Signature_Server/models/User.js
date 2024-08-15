"use strict";
const { Model } = require("sequelize");
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      User.hasOne(models.DigitalCertificate, { foreignKey: "user_id" });
      User.hasOne(models.EmailVerification, { foreignKey: "user_id" });
      User.hasOne(models.PublicKey, { foreignKey: "user_id" });
      User.hasMany(models.UserIDImage, { foreignKey: "user_id" });
      User.belongsToMany(models.Document, {
        through: models.VariousParties,
        foreignKey: "user_id",
      });
    }
  }
  User.init(
    {
      firstName: DataTypes.STRING,
      lastName: DataTypes.STRING,
      middleName: DataTypes.STRING,
      email: DataTypes.STRING,
      password: DataTypes.STRING,
    },
    {
      sequelize,
      modelName: "User",
    }
  );
  return User;
};
