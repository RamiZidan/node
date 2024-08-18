const express = require("express");
const router = express.Router();
const portalRequestController = require("../controllers/portalRequestController");
const isUser = require("../middlewares/userAuthMiddleware");
const isAdmin = require("../middlewares/adminAuthMiddleware");
const isGovernmentOfficial = require("../middlewares/govOfficialAuthMiddleware");
const isGeneralAdmins = require("../middlewares/generalAdminsAuthMiddleware");
const multer = require("../util/multer");
const Validator = require("../middlewares/validators/portalRequestVaildationMiddleware");

router.post(
  "/user/createPortalRequest",
  multer.uploadImage.single("taboImage"),
  isUser,
  Validator.createPortalRequestValidation,
  portalRequestController.createPortalRequest
);

router.get(
  "/user/getUserPortalRequests",
  isUser,
  portalRequestController.getUserPortalRequests
);

router.get(
  "/admin/getAllPortalRequests",
  isAdmin,
  portalRequestController.getAllPortalRequests
);

router.get(
  "/government/getGovPortalRequests",
  isGovernmentOfficial,
  portalRequestController.getGovPortalRequests
);

router.put(
  "/admin/checkPortalRequest/:req_id",
  isAdmin,
  Validator.checkPortalRequestValidatioon,
  portalRequestController.checkPortalRequest
);

router.put(
  "/government/processPortalRequest/:req_id",
  isGovernmentOfficial,
  Validator.processPortalRequestValidatioon,
  portalRequestController.processPortalRequest
);

router.delete(
  "/admin/deletePortalRequest/:req_id",
  isGeneralAdmins,
  portalRequestController.deletePortalRequest
);

module.exports = router;
