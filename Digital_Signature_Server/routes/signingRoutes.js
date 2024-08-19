const express = require("express");
const router = express.Router();
const signController = require("../controllers/digitalSigningController");
const CertificateController = require("../controllers/digitalCertificateController");
const multer = require("../util/multer");
const isUser = require("../middlewares/userAuthMiddleware");
const Validator = require("../middlewares/validators/userValidationMiddleware");

// router.post("/encryptionRSA", signController.encryptionRSA);

router.get("/RSA", signController.RSA);

// router.post("/encryptionRSA", signController.encryptionRSA);

router.get("/email/RSA", signController.RSA);

router.post("/signature/forgekey", signController.customKeyToForgeKey);

router.post(
  "/signature/DigitalSignature",
  multer.uploadDocument.single("privateKeyPath"),
  signController.digitalSigning
);

router.post(
  "/signature/VerifySignature/:document_id",
  isUser,
  signController.verifySignature
);

router.post(
  "/signature/signDocument",
  isUser,
  multer.uploadDocument.single("document"),
  Validator.uploadDocument,
  signController.signDocument
);

router.put(
  "/signature/partySign/:document_id",
  isUser,
  signController.partySign
);

module.exports = router;
