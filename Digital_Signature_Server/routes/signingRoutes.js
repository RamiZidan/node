const express = require("express");
const router = express.Router();
const signController = require("../controllers/digitalSigningController");
const CertificateController = require("../controllers/digitalCertificateController");
const multer = require("../util/multer");
const userAuth = require("../middlewares/userAuthMiddleware");
const Validator = require("../middlewares/validators/userValidationMiddleware");


// router.post("/encryptionRSA", signController.encryptionRSA);

router.get("/RSA", signController.RSA);

// router.post("/encryptionRSA", signController.encryptionRSA);

router.get("/email/RSA", signController.RSA);

router.post("/signature/forgekey", signController.customKeyToForgeKey);

router.post("/signature/DigitalSignature", signController.digitalSigning);

router.post("/signature/VerifySignature", signController.verifySignature);

router.post(
      "/signature/signDocument",
      userAuth,
      multer.uploadDocument.single("document"),
      Validator.uploadDocument,
      signController.signDocument
    );


module.exports = router;
