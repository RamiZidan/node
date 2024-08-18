const { validationResult, check } = require("express-validator");
const fs = require("fs");

const addContractValidation = [
  check("contractName", "Contract name field is required").trim().notEmpty(),
  check("contract").custom((value, { req }) => {
    if (!req.file) {
      throw new Error("The Contract is required");
    }
    return true;
  }),
  check("description", "Description field is required").trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      if (req.file) {
        fs.unlink(req.file.path, (unlinkErr) => {
          console.error("Failed to delete contract:", unlinkErr);
        });
      }
      return res.status(400).json(errors);
    }
    next();
  },
];

module.exports = { addContractValidation };
