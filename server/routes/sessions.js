const express = require("express");
const router = express.Router();
const sessionController = require("../controllers/session");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const sessionValidations = require("../middleware/validations/request/session");

router.get(
  "/getAll",
  protect,
  authorizeRoles("admin"),
  sessionValidations.validateQuery,
  sessionController.getUserSession
);

router.get(
  "/self",
  protect,
  authorizeRoles("admin"),
  sessionValidations.validateQuery,
  sessionController.getSelfSessions
);

module.exports = router;
