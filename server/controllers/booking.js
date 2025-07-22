const user = require("../models/user");
const area = require("../models/area");
const booking = require("../models/booking");
const session = require("../models/session");
const __ = require("../utils/responseUtil");
const dbUtils = require("../db/dbUtils");
const bookingConditions = require("../middleware/validations/data/bookingConditions");
const {
  sendEmail,
  cust_booking_mail_data,
  adm_booking_mail_data,
} = require("../utils/sendMail");
// const { convertDateFormat } = require("../utils/common");
const dotEnv = require("dotenv");
dotEnv.config();

const fetchLocation = async (name) => {
  try {
    const result = await dbUtils.findOneDataInDB(
      area,
      { name: name },
      { name: 1, location: 1, city: 1, state: 1, pinCode: 1, isActive: 1 }
    );
    return result;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

const createBooking = async (req, res) => {
  try {
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Start Booking cab" } }
    );
    const findBooking = await booking.findOne({
      customer: req.user._id,
      status: "pending",
    });
    if (findBooking) {
      return __.customErrMsg(
        req,
        res,
        403,
        "You already have a pending booking. Please cancel it first."
      );
    }
    const adminUser = await dbUtils.findOneDataInDB(
      user,
      { role: "admin" },
      { name: 1, email: 1 }
    );
    const { from, to, pickupTime } = req.body;
    const fromPlace = await fetchLocation(from);
    const toPlace = await fetchLocation(to);
    // const pickup_time = await convertDateFormat(pickupTime);
    const validate = await bookingConditions.createBooking(fromPlace, toPlace);
    if (validate) {
      return __.customErrMsg(req, res, 400, validate.message);
    }
    const createdData = await booking.create({
      customer: req.user._id,
      from: fromPlace._id,
      to: toPlace._id,
      pickupTime: pickupTime ? new Date(pickupTime) : new Date(),
    });
    const data = await booking
      .findById(createdData._id)
      .populate("from", "name location state pinCode")
      .populate("to", "name location state pinCode")
      .populate("customer", "_id name email phone")
      .select("_id customer driver from to pickupTime status createdAt")
      .lean()
      .exec();
    // if (data.driver == null) {
    //   data.driver = "Not assigned yet";
    // }
    data.driver = "Not assigned yet";
    const custMailData = await cust_booking_mail_data(req.user.name, data._id);
    await sendEmail(req.user.email, custMailData.subject, custMailData.content);
    const admMailData = await adm_booking_mail_data(
      data.customer.name,
      adminUser.name,
      data._id,
      data.customer._id
    );
    await sendEmail(adminUser.email, admMailData.subject, admMailData.content);
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: `Done booking cab - ID - ${data._id}` } }
    );
    return __.successMsg(req, res, 200, data, "Booking created successfully");
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error creating booking", err.message);
  }
};

const assignDriver = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const objId = await dbUtils.getObjID(bookingId);
    const driverList = await dbUtils.fetchFromDB(user, {
      role: "driver",
    });
    if (!driverList) {
      return __.customErrMsg(req, res, 404, "No drivers found");
    }
    // console.log("driverList", driverList);
    // assign random single driver from list of drivers in same city
    const driver = driverList[Math.floor(Math.random() * driverList.length)];
    // console.log("driver", driver);
    const driverId = await dbUtils.getObjID(driver._id);
    // console.log("driverId", driverId);
    const data = await booking
      .findByIdAndUpdate(
        { _id: objId },
        {
          $set: { driver: driverId, status: "assigned" },
        },
        { new: true }
      )
      .populate("from", "name location city state pinCode")
      .populate("to", "name location city state pinCode")
      .populate("driver", "name phone")
      .populate("customer", "name email phone")
      .select("_id customer driver from to pickupTime status")
      .lean()
      .exec();
    if (!data) {
      return __.customErrMsg(req, res, 404, "Booking not found");
    }
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: `Assigned Driver to Booking ${bookingId}` } }
    );
    return __.successMsg(req, res, 200, data, "Booking assigned successfully");
  } catch (err) {
    console.log(err);
    return __.errorMsg(
      req,
      res,
      500,
      "Error assigning booking to driver",
      err.message
    );
  }
};

// curr
const getBookingCustomer = async (req, res) => {
  try {
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Get Customer Ongoing Booking" } }
    );
    const findBooking = await booking.findOne({
      customer: req.user._id,
      status: { $nin: ["completed", "cancelled"] },
    });
    if (!findBooking) {
      return __.customErrMsg(req, res, 404, "No ongoing booking found");
    } else {
      const data = await booking
        .findById({ _id: findBooking._id })
        .populate("from", "name location city state pinCode")
        .populate("to", "name location city state pinCode")
        .populate("driver", "name phone")
        .populate("customer", "name email phone")
        .select("_id customer driver from to pickupTime status")
        .lean()
        .exec();
      if (!data) {
        return __.customErrMsg(req, res, 404, "No ongoing booking found");
      }
      if (data.driver == null) {
        data.driver = "Not assigned yet";
      }
      return __.successMsg(req, res, 200, data, "Data retrieved successfully");
    }
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error fetching booking", err.message);
  }
};

// curr
const getBookingDriver = async (req, res) => {
  try {
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Get Driver Ongoing Booking" } }
    );
    const findBooking = await booking.findOne({
      driver: req.user._id,
      status: {
        $in: ["assigned", "on-the-way"],
      },
    });
    if (!findBooking) {
      return __.customErrMsg(req, res, 404, "No ongoing booking found");
    }
    const data = await booking
      .findById({ _id: findBooking._id })
      .populate("from", "name location city state pinCode")
      .populate("to", "name location city state pinCode")
      .populate("driver", "name email phone")
      .populate("customer", "name phone")
      .select("_id customer driver from to pickupTime status")
      .lean()
      .exec();
    return __.successMsg(req, res, 200, data, "Data retrieved successfully");
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error fetching booking", err.message);
  }
};

// all
const getCustBookings = async (req, res) => {
  try {
    const { page, limit } = req.query; // Default values
    const skip = (Number(page) - 1) * Number(limit);
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return __.errorMsg(req, res, 400, "Invalid pagination parameters");
    }
    const searchQuery = {};
    if (req.query.searchField && req.query.searchValue) {
      searchQuery[req.query.searchField] = new RegExp(
        req.query.searchValue,
        "i"
      );
    }
    const sortObject = {};
    if (req.query.sortField && req.query.sortOrder) {
      if (req.query.sortOrder === "asc") {
        sortObject[req.query.sortField] = 1;
      } else if (req.query.sortOrder === "desc") {
        sortObject[req.query.sortField] = -1;
      } else {
        return __.errorMsg(req, res, 400, "Invalid sort order");
      }
    } else {
      sortObject.createdAt = -1; // Default sort by createdAt
    }
    const bookings = await booking
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "driver", // Simpler for direct matching
            foreignField: "_id",
            as: "driver",
          },
        },
        {
          $lookup: {
            from: "areas",
            localField: "from",
            foreignField: "_id",
            as: "from",
          },
        },
        {
          $lookup: {
            from: "areas",
            localField: "to",
            foreignField: "_id",
            as: "to",
          },
        },
        {
          $unwind: { path: "$from", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$to", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$customer", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$driver", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            customerId: "$customer._id",
            customerName: "$customer.name",
            customerPhone: "$customer.phone",
            customerEmail: "$customer.email",
            driverName: "$driver.name",
            driverPhone: "$driver.phone",
            ToName: "$to.name",
            ToLocation: "$to.location",
            ToCity: "$to.city",
            ToState: "$to.state",
            ToPinCode: "$to.pinCode",
            FromName: "$from.name",
            FromLocation: "$from.location",
            FromCity: "$from.city",
            FromState: "$from.state",
            FromPinCode: "$from.pinCode",
          },
        },
        {
          $project: {
            _id: 1,
            ToName: 1,
            ToCity: 1,
            ToLocation: 1,
            ToState: 1,
            ToPinCode: 1,
            FromName: 1,
            FromLocation: 1,
            FromCity: 1,
            FromState: 1,
            FromPinCode: 1,
            customerId: 1,
            customerName: 1,
            customerPhone: 1,
            customerEmail: 1,
            driverName: 1,
            driverPhone: 1,
            pickupTime: 1,
            status: 1,
          },
        },
        {
          $match: { customerId: req.user._id, ...searchQuery },
        },
        {
          $sort: sortObject,
        },
        {
          $skip: Number(skip),
        },
        {
          $limit: Number(limit),
        },
      ])
      .exec();
    const totalRecords = await booking.countDocuments({
      customer: req.user._id,
    });
    if (!bookings.length) {
      return __.customErrMsg(req, res, 404, "No bookings found");
    }
    return __.successMsg2(
      req,
      res,
      200,
      bookings,
      totalRecords,
      "Data retrieved successfully"
    );
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error fetching bookings", err.message);
  }
};

// all
const getDriverBookings = async (req, res) => {
  try {
    const { page, limit } = req.query; // Default values
    const skip = (Number(page) - 1) * Number(limit);
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return __.errorMsg(req, res, 400, "Invalid pagination parameters");
    }
    const searchQuery = {};
    if (req.query.searchField && req.query.searchValue) {
      searchQuery[req.query.searchField] = new RegExp(
        req.query.searchValue,
        "i"
      );
    }
    const sortObject = {};
    if (req.query.sortField && req.query.sortOrder) {
      if (req.query.sortOrder === "asc") {
        sortObject[req.query.sortField] = 1;
      } else if (req.query.sortOrder === "desc") {
        sortObject[req.query.sortField] = -1;
      } else {
        return __.errorMsg(req, res, 400, "Invalid sort order");
      }
    } else {
      sortObject.createdAt = -1; // Default sort by createdAt
    }
    const bookings = await booking
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "driver", // Simpler for direct matching
            foreignField: "_id",
            as: "driver",
          },
        },
        {
          $lookup: {
            from: "areas",
            localField: "from",
            foreignField: "_id",
            as: "from",
          },
        },
        {
          $lookup: {
            from: "areas",
            localField: "to",
            foreignField: "_id",
            as: "to",
          },
        },
        {
          $unwind: { path: "$from", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$to", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$customer", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$driver", preserveNullAndEmptyArrays: true },
        },
        {
          $addFields: {
            customerName: "$customer.name",
            customerPhone: "$customer.phone",
            driverId: "$driver._id",
            driverName: "$driver.name",
            driverPhone: "$driver.phone",
            ToName: "$to.name",
            ToLocation: "$to.location",
            ToCity: "$to.city",
            ToState: "$to.state",
            ToPinCode: "$to.pinCode",
            FromName: "$from.name",
            FromLocation: "$from.location",
            FromCity: "$from.city",
            FromState: "$from.state",
            FromPinCode: "$from.pinCode",
          },
        },
        {
          $project: {
            _id: 1,
            ToName: 1,
            ToCity: 1,
            ToLocation: 1,
            ToState: 1,
            ToPinCode: 1,
            FromName: 1,
            FromLocation: 1,
            FromCity: 1,
            FromState: 1,
            FromPinCode: 1,
            customerName: 1,
            customerPhone: 1,
            driverId: 1,
            driverName: 1,
            driverPhone: 1,
            pickupTime: 1,
            status: 1,
          },
        },
        {
          $match: { driverId: req.user._id, ...searchQuery },
        },
        {
          $sort: sortObject,
        },
        {
          $skip: Number(skip),
        },
        {
          $limit: Number(limit),
        },
      ])
      .exec();
    const totalRecords = await booking.countDocuments({
      driver: req.user._id,
    });
    if (!bookings.length) {
      return __.customErrMsg(req, res, 404, "No bookings found");
    }
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Get Driver All Bookings" } }
    );
    return __.successMsg2(
      req,
      res,
      200,
      bookings,
      totalRecords,
      "Data retrieved successfully"
    );
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error fetching bookings", err.message);
  }
};

// driver-side update status
const updateBookingStatus = async (req, res) => {
  try {
    const { bookingId, status } = req.body;
    const ObjectId = await dbUtils.getObjID(bookingId);
    const findBooking = await booking
      .findOne({
        _id: ObjectId,
        driver: req.user._id,
        status: { $in: ["assigned", "on-the-way"] },
      })
      .select("_id customer driver from to pickupTime status")
      .lean()
      .exec();
    // console.log("findBooking", findBooking);
    if (!findBooking) {
      return __.customErrMsg(req, res, 404, "No ongoing booking found");
    }
    // const objId = await dbUtils.getObjID(findBooking._id);
    const data = await booking
      .findByIdAndUpdate(
        { _id: findBooking._id },
        {
          $set: { status: status },
        },
        { new: true }
      )
      .populate("driver", "name phone")
      .populate("customer", "name phone")
      .populate("to", "name location city state pinCode")
      .populate("from", "name location city state pinCode")
      .select("_id customer driver to from pickupTime status")
      .lean()
      .exec();
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      {
        $push: { activities: `Updated Booking Status for Booking ${data._id}` },
      }
    );
    return __.successMsg(req, res, 200, data, "Status updated successfully");
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error updating status", err.message);
  }
};

const cancelMyBooking = async (req, res) => {
  try {
    const findBooking = await booking
      .findOne({
        customer: req.user._id,
        status: { $in: ["assigned", "on-the-way"] },
      })
      .lean()
      .exec();
    const objId = await dbUtils.getObjID(findBooking._id);
    const updatedData = await booking
      .findByIdAndUpdate(
        {
          _id: objId,
        },
        {
          $set: { status: "cancelled" },
        },
        { new: true }
      )
      .populate("driver", "name phone")
      .populate("customer", "name phone")
      .populate("from", "name location city state pinCode")
      .populate("to", "name location city state pinCode")
      .select("_id customer driver from to pickupTime status")
      .lean()
      .exec();
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: `Cancelled Booking ID - ${updatedData._id}` } }
    );
    return __.successMsg(
      req,
      res,
      200,
      updatedData,
      "Status updated successfully"
    );
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error updating status", err.message);
  }
};

const formatDate = async (dateStr) => {
  const date = new Date(dateStr);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed
  const year = date.getFullYear();
  return new Date(`${day}-${month}-${year}`);
};

const getAllBookings = async (req, res) => {
  try {
    const { page, limit } = req.query; // Default values
    const skip = (Number(page) - 1) * Number(limit);
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return __.errorMsg(req, res, 400, "Invalid pagination parameters");
    }
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Get All Bookings" } }
    );
    const searchQuery = {};
    if (req.query.searchField && req.query.searchValue) {
      searchQuery[req.query.searchField] = new RegExp(
        req.query.searchValue,
        "i"
      );
    }
    const sortObject = {};
    if (req.query.sortField && req.query.sortOrder) {
      if (req.query.sortOrder === "asc") {
        sortObject[req.query.sortField] = 1;
      } else if (req.query.sortOrder === "desc") {
        sortObject[req.query.sortField] = -1;
      } else {
        return __.errorMsg(req, res, 400, "Invalid sort order");
      }
    } else {
      sortObject.createdAt = -1; // Default sort by createdAt
    }
    const bookings = await booking
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "customer",
            foreignField: "_id",
            as: "customer",
          },
        },
        {
          $lookup: {
            from: "users",
            localField: "driver", // Simpler for direct matching
            foreignField: "_id",
            as: "driver",
          },
        },
        {
          $lookup: {
            from: "areas",
            localField: "from",
            foreignField: "_id",
            as: "from",
          },
        },
        {
          $lookup: {
            from: "areas",
            localField: "to",
            foreignField: "_id",
            as: "to",
          },
        },
        {
          $unwind: { path: "$from", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$to", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$customer", preserveNullAndEmptyArrays: true },
        },
        {
          $unwind: { path: "$driver", preserveNullAndEmptyArrays: true },
        },
        {
          $sort: {
            createdAt: -1,
          },
        },
        {
          $addFields: {
            customerName: "$customer.name",
            customerPhone: "$customer.phone",
            customerEmail: "$customer.email",
            driverName: "$driver.name",
            driverPhone: "$driver.phone",
            driverEmail: "$driver.email",
            ToName: "$to.name",
            ToLocation: "$to.location",
            ToCity: "$to.city",
            ToState: "$to.state",
            ToPinCode: "$to.pinCode",
            FromName: "$from.name",
            FromLocation: "$from.location",
            FromCity: "$from.city",
            FromState: "$from.state",
            FromPinCode: "$from.pinCode",
          },
        },
        {
          $project: {
            _id: 1,
            ToName: 1,
            ToCity: 1,
            ToLocation: 1,
            ToState: 1,
            ToPinCode: 1,
            FromName: 1,
            FromLocation: 1,
            FromCity: 1,
            FromState: 1,
            FromPinCode: 1,
            customerName: 1,
            customerPhone: 1,
            customerEmail: 1,
            driverName: 1,
            driverPhone: 1,
            driverEmail: 1,
            pickupTime: 1,
            status: 1,
          },
        },
        {
          $match: searchQuery,
        },
        {
          $sort: sortObject,
        },
        {
          $skip: Number(skip),
        },
        {
          $limit: Number(limit),
        },
      ])
      .exec();
    const totalRecords = await booking.countDocuments();
    if (!bookings.length) {
      return __.customErrMsg(req, res, 404, "No Bookings found");
    }
    return __.successMsg2(
      req,
      res,
      200,
      bookings,
      totalRecords,
      "Data retrieved successfully"
    );
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error fetching bookings", err.message);
  }
};

const getOneBooking = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const ObjectId = await dbUtils.getObjID(bookingId);
    const data = await booking
      .findById(ObjectId)
      .populate("driver", "_id name email phone role")
      .populate("customer", "_id name email phone role")
      .populate("from", "_id name location city state pinCode")
      .populate("to", "_id name location city state pinCode")
      .select(
        "_id customer driver from to pickupTime status createdAt updatedAt"
      )
      .lean()
      .exec();
    if (!data) {
      return __.customErrMsg(req, res, 404, "No Booking found");
    }
    return __.successMsg(req, res, 200, data, "Data retrieved successfully");
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error fetching booking", err.message);
  }
};

module.exports = {
  createBooking,
  assignDriver,
  getBookingCustomer,
  getBookingDriver,
  getCustBookings,
  getDriverBookings,
  updateBookingStatus,
  getAllBookings,
  cancelMyBooking,
  getOneBooking,
};
