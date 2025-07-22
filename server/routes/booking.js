const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const authorizeRoles = require("../middleware/roleMiddleware");
const bookingController = require("../controllers/booking");
const {
  validationBody,
  validationQuery,
  validationParams,
  getUserBookings,
  update,
} = require("../middleware/validations/request/booking");

router.post(
  "/create",
  protect,
  authorizeRoles("customer"),
  validationBody,
  bookingController.createBooking
);

router.put(
  "/assignDriver/:bookingId",
  protect,
  authorizeRoles("admin"),
  validationParams,
  bookingController.assignDriver
);

router.get(
  "/customer/current",
  protect,
  authorizeRoles("customer"),
  bookingController.getBookingCustomer
);

router.get(
  "/driver/current",
  protect,
  authorizeRoles("driver"),
  bookingController.getBookingDriver
);

router.put(
  "/updateStatus",
  protect,
  authorizeRoles("driver"),
  update,
  bookingController.updateBookingStatus
);

router.put(
  "/cancel",
  protect,
  authorizeRoles("customer"),
  bookingController.cancelMyBooking
);

router.get(
  "/getAllBookings",
  protect,
  authorizeRoles("admin"),
  validationQuery,
  bookingController.getAllBookings
);

router.get(
  "/getCustBookings",
  protect,
  authorizeRoles("customer"),
  getUserBookings,
  bookingController.getCustBookings
);

router.get(
  "/getDriverBookings",
  protect,
  authorizeRoles("driver"),
  getUserBookings,
  bookingController.getDriverBookings
);

router.get(
  "/single/:bookingId",
  protect,
  authorizeRoles("admin", "customer", "driver"),
  bookingController.getOneBooking
);

module.exports = router;
