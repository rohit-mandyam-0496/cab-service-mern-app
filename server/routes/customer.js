const express = require("express");
const router = express.Router();
const userController = require("../controllers/user");
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const userValidations = require("../middleware/validations/request/user"); //userValidations

router.post("/register", userValidations.register, userController.register);
router.post(
  "/login",
  userValidations.login,
  userController.login
);

router.post(
  "/sendOTP",
  protect,
  authorizeRoles("customer"),
  userController.sendOTP
);
router.put(
  "/verifyEmail",
  protect,
  authorizeRoles("customer"),
  userValidations.verifyEmail,
  userController.verifyEmail
);

router.get(
  "/profile",
  protect,
  authorizeRoles("customer"),
  userController.getUserById
);

router.put(
  "/updateDetails",
  protect,
  authorizeRoles("customer"),
  userValidations.update,
  userController.updateDetails
);

router.put(
  "/passwordReset",
  userValidations.resetPassword,
  userController.resetPassword
);

router.post(
  "/logout",
  protect,
  authorizeRoles("customer"),
  userValidations.logout,
  userController.logout
);

router.delete(
  "/deleteProfile",
  protect,
  authorizeRoles("customer"),
  userValidations.deleteUser,
  userController.deleteUser
);

module.exports = router;
