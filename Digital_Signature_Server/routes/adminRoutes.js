const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAdmin = require("../middlewares/adminAuthMiddleware");
const multer = require("../util/multer");
const Validator = require("../middlewares/validators/adminValidationMiddleware");

router.get("/admin/getAllUsers", isAdmin, adminController.getAllUsers);
router.get("/admin/getUserById/:userId", isAdmin, adminController.getUserById);
router.delete(
  "/admin/deleteUser/:user_id",
  isAdmin,
  adminController.deleteUser
);
router.put(
  "/admin/blockUser/:user_id",
  isAdmin,
  adminController.blockUser
);

router.get("/admin/getAllAdmins", isAdmin, adminController.getAllAdmins);

router.get("/admin/getAllContracts", isAdmin, adminController.getAllContracts);
router.post(
  "/admin/addContract",
  multer.uploadDocument.single("contract"),
  isAdmin,
  Validator.addContractValidation,
  adminController.addContract
);
router.delete(
  "/admin/deleteContract/:contract_id",
  isAdmin,
  adminController.deleteContract
);

router.get("/admin/getAllDocuments", isAdmin, adminController.getAllDocuments);
// router.get9'/admin/documents/:documentId' , isAdmin 
router.get("/admin/getUserById/:userId", isAdmin, adminController.getUserById);

router.get(
  "/admin/getUserDocumentsById/:userId",
  isAdmin,
  adminController.getUserDocumentsById
);

module.exports = router;
