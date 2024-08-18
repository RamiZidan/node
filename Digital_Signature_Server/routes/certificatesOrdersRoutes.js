const express = require("express");
const router = express.Router();
const CertificateController = require("../controllers/digitalCertificateController");
const multer = require("../util/multer");
const userAuth = require("../middlewares/userAuthMiddleware");
const Auth = require("../middlewares/generalAdminsAuthMiddleware");

router.post(
  "/C_Orders/uploadUserData",
  multer.uploadImage.fields([
    {
      name: "image_frontSide",
      maxCount: 1,
    },
    {
      name: "image_backSide",
      maxCount: 1,
    },
  ]),
  userAuth,
  CertificateController.uploadUserData
);

router.post(
  "/C_Orders/changeOrderStatus",
  userAuth,
  CertificateController.changeOrderStatus
);

router.post(
  "/C_Orders/createDigitalCertificate",
  userAuth,
  CertificateController.createDigitalCertificate
);

router.post(
  "/C_Orders/verifyCertificate",
  multer.uploadDocument.single("document"),
  userAuth,
  CertificateController.verifyCertificate
);
router.get(
  "/C_Orders/getAllCertificateOrders",
  Auth,
  CertificateController.getAllCertificateOrders
);

module.exports = router;
