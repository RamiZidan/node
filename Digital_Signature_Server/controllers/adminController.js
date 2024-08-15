const models = require("../models/index");
const CustomError = require("../util/CustomError");

exports.getAllUsers = async (req, res, next) => {
  try {
    const userData = await models.User.findAll();
    if (userData.length > 0) {
      return res.status(200).json({ message: "Success", data: userData });
    } else {
      return res
        .status(200)
        .json({ message: "There is no users to show", data: userData });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllAdmins = async (req, res, next) => {
  try {
    const admins = await models.Admin.findAll();
    if (admins.length === 0) {
      return res.status(200).json({
        message: "There is no admins to show",
        data: admins,
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: admins,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllContracts = async (req, res, next) => {
  try {
    const contracts = await models.Contract.findAll();
    if (contracts.length === 0) {
      return res.status(200).json({
        message: "there is no contracts to show",
        data: contracts,
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: contracts,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllDocuments = async (req, res, next) => {
  try {
    const documents = await models.Document.findAll();
    if (documents.length === 0) {
      return res.status(200).json({
        message: "there is no documents to show",
        data: documents,
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: documents,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const userId = await req.params.userId;
    const user = await models.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(200).json({
        message: "there is no user with this id",
        data: user,
      });
    } else {
      return res.status(200).json({
        message: "Success",
        data: user,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getUserDocumentsById = async (req, res, next) => {
  try {
    const userId = req.params.userId;
    const user = await models.User.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(200).json({
        message: "there is no user with this id",
        data: user,
      });
    } else {
      const userData = await models.User.findOne({
        where: { id: user.id },
        include: models.Document,
      });
      if (userData.Documents.length === 0) {
        return res.status(200).json({
          message: "there is no documents to show",
          data: userData.Documents,
        });
      }
      return res.status(200).json({
        message: "Success",
        data: userData.Documents,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.search = (req, res, next) => {};
