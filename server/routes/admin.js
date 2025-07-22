const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const userValidations = require("../middleware/validations/request/user");

router.post("/register", userValidations.register, userController.register);
router.post("/login", userValidations.login, userController.login);

router.put(
  "/updateDetails",
  protect,
  authorizeRoles("admin"),
  userValidations.update,
  userController.updateDetails
);

router.get(
  "/userListing",
  protect,
  authorizeRoles("admin"),
  userController.userListing
);
router.get(
  "/driverListing",
  protect,
  authorizeRoles("admin"),
  userController.driverListing
);

router.put(
  "/passwordReset",
  userValidations.resetPassword,
  userController.resetPassword
);

router.post(
  "/sendOTP",
  protect,
  authorizeRoles("admin"),
  userController.sendOTP
);
router.put(
  "/verifyEmail",
  protect,
  authorizeRoles("admin"),
  userValidations.verifyEmail,
  userController.verifyEmail
);

router.get(
  "/profile",
  protect,
  authorizeRoles("admin"),
  userController.getUserById
);

router.delete(
  "/deleteProfile",
  protect,
  authorizeRoles("admin"),
  userValidations.deleteUser,
  userController.deleteUser
);

router.post(
  "/logout",
  protect,
  authorizeRoles("admin"),
  userValidations.logout,
  userController.logout
);

module.exports = router;
