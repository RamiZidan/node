const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const isUser = require("../middlewares/userAuthMiddleware");
const multer = require("../util/multer");
const Validator = require("../middlewares/validators/userValidationMiddleware");

// router.post(
//   "/user/uploadIdImages",
//   isUser,
//   multer.uploadImage.fields([
//     {
//       name: "image_frontSide",
//       maxCount: 1,
//     },
//     {
//       name: "image_backSide",
//       maxCount: 1,
//     },
//   ]),
//   Validator.uploadIdImages,
//   userController.uploadIdImages
// );

router.post(
  "/user/uploadDocument",
  isUser,
  multer.uploadDocument.single("document"),
  Validator.uploadDocument,
  userController.uploadDocument
);

router.get("/user/getUser", isUser, userController.getUser);

router.get("/user/getUserDocuments", isUser, userController.getUserDocuments);

router.delete(
  "/user/deleteDocument/:document_id",
  isUser,
  userController.deleteDocument
);

router.get(
  "/user/getDocumentParties/:document_id",
  isUser,
  userController.getDocumentParties
);

module.exports = router;
