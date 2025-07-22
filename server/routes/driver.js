const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const userValidations = require("../middleware/validations/request/user");

router.post("/register", userValidations.register, userController.register);
router.post("/login", userValidations.login, userController.login);

router.post(
  "/sendOTP",
  protect,
  authorizeRoles("driver"),
  userController.sendOTP
);
router.put(
  "/verifyEmail",
  protect,
  authorizeRoles("driver"),
  userValidations.verifyEmail,
  userController.verifyEmail
);

router.get(
  "/profile",
  protect,
  authorizeRoles("driver"),
  userController.getUserById
);

router.put(
  "/passwordReset",
  userValidations.resetPassword,
  userController.resetPassword
);

router.put(
  "/updateDetails",
  protect,
  authorizeRoles("driver"),
  userValidations.update,
  userController.updateDetails
);

router.delete(
  "/deleteProfile",
  protect,
  authorizeRoles("driver"),
  userValidations.deleteUser,
  userController.deleteUser
);

router.post(
  "/logout",
  protect,
  authorizeRoles("driver"),
  userValidations.logout,
  userController.logout
);

module.exports = router;
