const { validationResult, check } = require("express-validator");
const fs = require("fs");

const createPortalRequestValidation = [
  check("reqName", "the request name is required")
    .trim()
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage("The Name too Long"),
  check("taboImage", "The tabo image is required").custom(
    (taboImage, { req }) => {
      if (!req.file) {
        throw new Error("The tabo image is required");
      }
      return true;
    }
  ),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          if (unlinkErr) console.error("Failed to delete image:", unlinkErr);
        });
      }
      return res.status(400).json(errors);
    }
    next();
  },
];

const checkPortalRequestValidatioon = [
  check("reqStatus", "the status is required")
    .trim()
    .notEmpty(),
    // .isIn(["pending", "published", "rejected"])
    // .withMessage("the status valud is incorrect"),
  check("message"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    next();
  },
];

const processPortalRequestValidatioon = [
  check("reqStatus", "the status is required")
    .trim()
    .notEmpty(),
    // .isIn(["approved", "published", "rejected"])
    // .withMessage("the status valud is incorrect"),
  check("message"),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json(errors);
    }
    next();
  },
];

module.exports = {
  createPortalRequestValidation,
  checkPortalRequestValidatioon,
  processPortalRequestValidatioon,
};
