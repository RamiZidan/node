const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");
const Validator = require("../middlewares/validators/authValidationMiddleware");
const multer = require("../util/multer");

// routes:
router.post(
  "/user/register",
  Validator.userRegisterValidation,
  authController.userRegister
);

router.post("/user/login", Validator.userLoginValidation, authController.login);

module.exports = router;
