'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class DigitalCertificate extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  DigitalCertificate.init({
    version: DataTypes.STRING,
    serialNumber: DataTypes.INTEGER,
    signatureAlgorithm: DataTypes.STRING,
    issuer: DataTypes.STRING,
    validatePeriod: DataTypes.DATE,
    subject: DataTypes.STRING,
    organization: DataTypes.STRING,
    ca_signature: DataTypes.TEXT
  }, {
    sequelize,
    modelName: 'DigitalCertificate',
  });
  return DigitalCertificate;
};