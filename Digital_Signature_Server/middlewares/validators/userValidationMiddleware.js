const { validationResult, check } = require("express-validator");
const fs = require("fs");
const uploadIdImages = [
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
      }
      return res.status(400).json(errors);
    }
    next();
  },
];

const uploadDocument = [
  check("documentName").trim(),
  check("document", "The document is required").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("The Document is required");
    }
    return true;
  }),
  check("emails")
    .isArray()
    .withMessage("the emails input must be an array")
    .custom((emails, { req }) => {
      for (const email of emails) {
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          throw new Error(`${email} is not a valid email address`);
        }
      }
      return true;
    }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          console.error("Failed to delete document:", unlinkErr);
        });
      }
      return res.status(400).json(errors);
    }
    next();
  },
];
module.exports = { uploadIdImages, uploadDocument };
