const express = require("express");
const router = express.Router();
const signController = require("../controllers/digitalSigningController");
const CertificateController = require("../controllers/digitalCertificateController");
const multer = require("../util/multer");
const userAuth = require("../middlewares/userAuthMiddleware");

// router.post("/encryptionRSA", signController.encryptionRSA);

router.get("/RSA", signController.RSA);

// router.post("/encryptionRSA", signController.encryptionRSA);

router.get("/email/RSA", signController.RSA);

router.post("/signature/forgekey", signController.customKeyToForgeKey);

router.post("/signature/DigitalSignature", signController.digitalSigning);

router.post("/signature/VerifySignature", signController.verifySignature);



module.exports = router;
