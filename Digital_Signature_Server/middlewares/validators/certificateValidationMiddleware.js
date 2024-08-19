const { validationResult, check } = require("express-validator");
const fs = require("fs");

const uploadUserDataValidation = [
  check("fullName", "fullName name is required")
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage("The Name too Long"),
  check("nationalNumber", "nationalNumber name is required")
    .notEmpty()
    .isLength({ max: 50 })
    .withMessage("The Name too Long"),
  check("image_frontSide", "The Front Side of the ID is required").custom(
    (value, { req }) => {
      if (!req.files || !req.files.image_frontSide) {
        throw new Error("The Front Side of the ID is required");
      }
      return true;
    }
  ),
  check("image_backSide", "The Back Side of the ID is required").custom(
    (value, { req }) => {
      if (!req.files || !req.files.image_backSide) {
        throw new Error("The Back Side of the ID is required");
      }
      return true;
    }
  ),
  check("liveImage", "The liveImage is required").custom((value, { req }) => {
    if (!req.files || !req.files.liveImage) {
      throw new Error("The liveImage is required");
    }
    return true;
  }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      // If There Is Some Error then delete the uploaded files
      if (req.files) {
        if (req.files.image_frontSide && req.files.image_frontSide[0]) {
          fs.unlink(req.files.image_frontSide[0].path, (unlinkErr) => {
            if (unlinkErr)
              console.error("Failed to delete front side image:", unlinkErr);
          });
        }
        if (req.files.image_backSide && req.files.image_backSide[0]) {
          fs.unlink(req.files.image_backSide[0].path, (unlinkErr) => {
            if (unlinkErr)
              console.error("Failed to delete back side image:", unlinkErr);
          });
        }
        if (req.files.liveImage && req.files.liveImage[0]) {
          fs.unlink(req.files.liveImage[0].path, (unlinkErr) => {
            if (unlinkErr)
              console.error("Failed to delete live Image:", unlinkErr);
          });
        }
      }
      return res.status(400).json(errors);
    }
    next();
  },
];

module.exports = { uploadUserDataValidation };
