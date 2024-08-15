const express = require("express");
const router = express.Router();
const adminController = require("../controllers/adminController");
const isAdmin = require("../middlewares/adminAuthMiddleware");

router.get("/admin/getAllUsers", isAdmin, adminController.getAllUsers);

router.get("/admin/getAllAdmins", isAdmin, adminController.getAllAdmins);

router.get("/admin/getAllContracts", isAdmin, adminController.getAllContracts);

router.get("/admin/getAllDocuments", isAdmin, adminController.getAllDocuments);

router.get("/admin/getUserById/:userId", isAdmin, adminController.getUserById);

router.get(
  "/admin/getUserDocumentsById/:userId",
  isAdmin,
  adminController.getUserDocumentsById
);

module.exports = router;
