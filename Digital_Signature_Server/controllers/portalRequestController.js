const models = require("../models/index");
const path = require("path");
const CustomError = require("../util/CustomError");
const fs = require("fs");
const { data } = require("node-openssl-cert/name_mappings");

exports.createPortalRequest = async (req, res, next) => {
  try {
    const portalReq = await models.RealEstatePortalRequest.create({
      reqName: req.body.reqName,
      taboImage: path.relative("public", req.file.path),
      reqStatus: "pending",
      user_id: req.user.id,
    });
    res.status(200).json({
      message: "Success",
      data: portalReq,
    });
  } catch (err) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
    next(err);
  }
};

// user
exports.getUserPortalRequests = async (req, res, next) => {
  try {
    const portalRequests = await models.RealEstatePortalRequest.findAll({
      where: { user_id: req.user.id },
    });
    if (portalRequests.length === 0) {
      return res.status(200).json({
        message: "there is no requests to show",
      });
    }
    return res.status(200).json({
      message: "success",
      data: portalRequests,
    });
  } catch (err) {
    next(err);
  }
};

// admin and government
exports.getAllPortalRequests = async (req, res, next) => {
  try {
    const portalRequests = await models.RealEstatePortalRequest.findAll({
      include: [{ model: models.User }],
    });
    if (portalRequests.length === 0) {
      return res.status(200).json({
        message: "there is no portal requests to show",
        data: portalRequests,
      });
    }
    return res.json({
      message: "Success",
      data: portalRequests,
    });
  } catch (err) {
    next(err);
  }
};

exports.getGovPortalRequests = async (req, res, next) => {
  try {
    const portalRequests = await models.RealEstatePortalRequest.findAll({
      where: { reqStatus: "published" || "approved" || "rejected" },
      include: [{ model: models.User }],
    });
    if (portalRequests.length === 0) {
      return res.status(200).json({
        message: "there is no portal requests to show",
        data: portalRequests,
      });
    }
    return res.status(200).json({
      message: "Success",
      data: portalRequests,
    });
  } catch (err) {
    next(err);
  }
};

// admin
exports.checkPortalRequest = async (req, res, next) => {
  try {
    const portalRequest = await models.RealEstatePortalRequest.findOne({
      where: { id: req.params.req_id },
    });
    if (!portalRequest) {
      return res.status(200).json({
        message: "there is no portal request with this id",
        data: portalRequest,
      });
    }
    portalRequest.reqStatus = req.body.reqStatus;
    portalRequest.admin_id = req.admin.id;
    portalRequest.save();
    return res.status(200).json({
      message: "success",
      data: portalRequest,
    });
  } catch (err) {
    next(err);
  }
};

// admin
exports.checkPortalRequest = async (req, res, next) => {
  try {
    const portalRequest = await models.RealEstatePortalRequest.findOne({
      where: { id: req.params.req_id },
    });
    if (!portalRequest) {
      return res.status(200).json({
        message: "there is no portal request with this id",
        data: portalRequest,
      });
    }
    portalRequest.reqStatus = req.body.reqStatus;
    portalRequest.admin_id = req.admin.id;
    portalRequest.message = req.body.message || null;
    portalRequest.save();
    return res.status(200).json({
      message: "success",
      data: portalRequest,
    });
  } catch (err) {
    next(err);
  }
};

// gov
exports.processPortalRequest = async (req, res, next) => {
  try {
    const portalRequest = await models.RealEstatePortalRequest.findOne({
      where: { id: req.params.req_id },
    });
    if (!portalRequest) {
      return res.status(200).json({
        message: "there is no portal request with this id",
        data: portalRequest,
      });
    }
    portalRequest.reqStatus = req.body.reqStatus;
    portalRequest.governmentOfficial_id = req.admin.id;
    portalRequest.message = req.body.message || null;
    portalRequest.save();
    return res.status(200).json({
      message: "success",
      data: portalRequest,
    });
  } catch (err) {
    next(err);
  }
};

exports.deletePortalRequest = async (req, res, next) => {
  try {
    const portalRequest = await models.RealEstatePortalRequest.findOne({
      where: { id: req.params.req_id },
    });
    if (!portalRequest) {
      return res.status(200).json({
        message: "there is no request with this id",
      });
    }
    await portalRequest.destroy();
    return res.status(200).json({
      message: "Request deleted successfully",
    });
  } catch (err) {
    next(err);
  }
};
