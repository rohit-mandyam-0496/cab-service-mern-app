const user = require("../models/user");
const session = require("../models/session");
const __ = require("../utils/responseUtil");
const bcrypt = require("bcrypt");
const userConditions = require("../middleware/validations/data/userConditions");
const { generateToken } = require("../middleware/auth/encode");
const dbUtils = require("../db/dbUtils");
const { sendEmail, OTP_mail_data } = require("../utils/sendMail");
const { generateOTP } = require("../utils/otpGenerator");
const { diffInMS, formatMS } = require("../utils/sessionTime");
const dotEnv = require("dotenv");
dotEnv.config();

const register = async (req, res) => {
  try {
    const sessionData = await session.create({
      activities: ["Registration Initiated"],
      loginTime: new Date(),
    });
    const { name, email, password, role, contactNumber } = req.body;
    const checkUser = await dbUtils.findOneDataInDB(user, {
      role: role,
      $or: [{ email: email }, { phone: contactNumber }],
    });
    const validate = await userConditions.registerStage(
      checkUser,
      email,
      role,
      contactNumber
    );
    if (validate) {
      return __.customErrMsg(req, res, validate.status, validate.message);
    }
    const data = await dbUtils.createDataInDB(user, {
      name,
      email,
      password,
      role,
      phone: contactNumber,
    });
    const updateSession = await session.findOneAndUpdate(
      { _id: sessionData._id },
      {
        $push: {
          activities: `Registration Completed - Role: ${role}, Name: ${name}, Email: ${email}`,
        },
        $set: { userId: data._id, logoutTime: new Date() },
      },
      { new: true, projection: { _id: 1, loginTime: 1, logoutTime: 1 } }
    );
    const diff_in_ms = await diffInMS(
      updateSession.logoutTime,
      updateSession.loginTime
    );
    const formattedDiff = await formatMS(diff_in_ms);
    await session.updateOne(
      { _id: updateSession._id },
      { $set: { sessionTime: formattedDiff } }
    );
    return __.successMsg(
      req,
      res,
      200,
      data,
      `${data.role} registered successfully`
    );
  } catch (error) {
    console.error(error);
    return __.errorMsg(req, res, 500, "Error registering user", error.message);
  }
};

const login = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const filter = { email: email, role: role };
    const checkUser = await dbUtils.findOneDataInDB(user, filter, {
      _id: 1,
      email: 1,
      password: 1,
      phone: 1,
      role: 1,
      loginCount: 1,
      logoutCount: 1,
      loggedOut: 1,
    });
    if (!checkUser) {
      return __.customErrMsg(req, res, 404, "User not found, please register");
    }
    const checkPassword = await bcrypt.compare(password, checkUser.password);
    const validate = await userConditions.loginStage(
      checkUser,
      email,
      role,
      checkPassword
    );
    if (validate) {
      return __.customErrMsg(req, res, validate.status, validate.message);
    }
    const sessionData = await dbUtils.createDataInDB(session, {
      userId: checkUser._id,
      loginTime: new Date(),
      activities: ["Login"],
    });
    const payload = {
      _id: checkUser._id,
      email: checkUser.email,
      phone: checkUser.phone,
      role: checkUser.role,
      sessionId: sessionData._id,
    };
    const authToken = await generateToken(payload);
    const data = await dbUtils.updateOneDataInDB(
      user,
      filter,
      {
        $set: {
          jwToken: authToken,
          loggedOut: false,
          loginCount: parseInt(checkUser.loginCount) + 1,
        },
      },
      {
        _id: 1,
        name: 1,
        role: 1,
        email: 1,
        password: 1,
        phone: 1,
        jwToken: 1,
        verifiedEmail: 1,
        loginCount: 1,
        logoutCount: 1,
        loggedOut: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    return __.successMsg(req, res, 200, data, "Login successful");
  } catch (error) {
    console.error(error);
    return __.errorMsg(req, res, 500, "Error logging in", error.message);
  }
};

const sendOTP = async (req, res) => {
  try {
    const filter = { _id: req.user._id };
    const otp_TTL = process.env.OTP_TTL;
    const { otp, expiryTime } = await generateOTP(otp_TTL);
    const checkUser = await dbUtils.findOneDataInDB(user, filter, {
      name: 1,
      role: 1,
      verifiedEmail: 1,
    });
    const validate = await userConditions.verifyOTPStage(
      checkUser.verifiedEmail
    );
    if (validate) {
      return __.customErrMsg(req, res, validate.status, validate.message);
    }
    const emailData = await OTP_mail_data(
      checkUser.role,
      checkUser.name,
      "Email ID",
      otp
    );
    await sendEmail(req.user.email, emailData.subject, emailData.content);
    const data = await dbUtils.updateDataInDB(
      user,
      filter,
      {
        $set: {
          emailOtp: otp,
          emailOtpExpiresAt: expiryTime,
        },
      },
      {
        _id: 1,
        name: 1,
        email: 1,
        emailOtp: 1,
        verifiedEmail: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Send Email OTP" } }
    );
    return __.successMsg(
      req,
      res,
      200,
      data,
      "OTP sent successfully. Please verify your email using the OTP"
    );
  } catch (error) {
    console.error(error);
    return __.errorMsg(req, res, 500, "Error sending OTP", error.message);
  }
};

const verifyEmail = async (req, res) => {
  try {
    let filter = { _id: req.user._id };
    const { otp } = req.body;
    const checkUser = await dbUtils.findOneDataInDB(user, filter, {
      emailOtp: 1,
      emailOtpExpiresAt: 1,
      verifiedEmail: 1,
    });
    const validate = await userConditions.verifyOTPStage(
      checkUser.verifiedEmail,
      checkUser.emailOtp,
      checkUser.emailOtpExpiresAt,
      otp
    );
    if (validate) {
      return __.customErrMsg(req, res, validate.status, validate.message);
    }
    const data = await dbUtils.updateDataInDB(
      user,
      filter,
      {
        $set: {
          emailOtp: "",
          emailOtpExpiresAt: null,
          verifiedEmail: true,
        },
      },
      {
        _id: 1,
        name: 1,
        role: 1,
        email: 1,
        password: 1,
        phone: 1,
        jwToken: 1,
        verifiedEmail: 1,
        loginCount: 1,
        logoutCount: 1,
        loggedOut: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Verify Email" } }
    );
    return __.successMsg(req, res, 200, data, "Email verified successfully");
  } catch (error) {
    console.error(error);
    return __.errorMsg(req, res, 500, "Error verifying email", error.message);
  }
};

const updateDetails = async (req, res) => {
  try {
    let setFields;
    const userId = req.user._id;
    if (req.body.email !== req.user.email) {
      setFields = { email: req.body.email, verifiedEmail: false };
    }
    const data = await dbUtils.updateDataInDB(
      user,
      { _id: userId },
      {
        $set: {
          name: req.body.name,
          phone: req.body.phone,
        },
        ...setFields,
      },
      {
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Update Details" } }
    );
    return __.successMsg(req, res, 200, data, "Details updated successfully");
  } catch (error) {
    console.error(error);
    return __.errorMsg(req, res, 500, "Error updating details", error.message);
  }
};

const userListing = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    // Validate page and limit
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
    // Construct sort object
    const sortObject = {};
    if (req.query.sortField && req.query.sortOrder) {
      if (req.query.sortOrder === "asc") {
        sortObject[req.query.sortField] = 1;
      } else if (req.query.sortOrder === "desc") {
        sortObject[req.query.sortField] = -1;
      } else {
        return __.errorMsg(req, res, 400, "Invalid sort order");
      }
      //sortObject[req.query.sortField] = req.query.sortOrder === "asc" ? 1 : -1;
    } else {
      sortObject.createdAt = -1; // Default sort by createdAt
    }
    const data = await user
      .find(
        { role: "customer", ...searchQuery },
        {
          _id: 1,
          role: 1,
          name: 1,
          email: 1,
          phone: 1,
          verifiedEmail: 1,
          loginCount: 1,
          logoutCount: 1,
          loggedOut: 1,
          createdAt: 1,
          updatedAt: 1,
        }
      )
      .sort(sortObject)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    const totalRecords = await user.countDocuments({ role: "customer" });
    // console.log("data", data, totalRecords);
    const validate = await userConditions.listingStage(data);
    if (validate) {
      return __.customErrMsg(req, res, validate.status, validate.message);
    }
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "User Listing" } }
    );
    return __.successMsg2(
      req,
      res,
      200,
      data,
      totalRecords,
      "Data retrieved successfully"
    );
  } catch (error) {
    console.error("Error in Listing users", error);
    return __.errorMsg(req, res, 503, "Error retrieving Data", error.message);
  }
};

const driverListing = async (req, res) => {
  try {
    const { page, limit } = req.query;
    const skip = (Number(page) - 1) * Number(limit);
    // Validate page and limit
    if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
      return __.errorMsg(req, res, 400, "Invalid pagination parameters");
    }
    const data = await user
      .find(
        { role: "driver" },
        {
          _id: 1,
          role: 1,
          name: 1,
          email: 1,
          phone: 1,
          verifiedEmail: 1,
          loginCount: 1,
          logoutCount: 1,
          loggedOut: 1,
        }
      )
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    const totalRecords = await user.countDocuments({ role: "driver" });
    const validate = await userConditions.listingStage(data);
    if (validate) {
      return __.customErrMsg(req, res, validate.status, validate.message);
    }
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Driver Listing" } }
    );
    return __.successMsg2(
      req,
      res,
      200,
      data,
      totalRecords,
      "Data retrieved successfully"
    );
  } catch (error) {
    console.error("Error in Listing drivers", error);
    return __.errorMsg(req, res, 503, "Error retrieving Data", error.message);
  }
};

const getUserById = async (req, res) => {
  try {
    const data = await dbUtils.fetchFromDBById(
      user,
      {
        _id: req.user._id,
      },
      {
        _id: 1,
        role: 1,
        name: 1,
        email: 1,
        phone: 1,
        location: 1,
        loginCount: 1,
        logoutCount: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "User Profile" } }
    );
    return __.successMsg(req, res, 200, data, "Data retrieved successfully");
  } catch (error) {
    console.error(error);
    return __.errorMsg(req, res, 500, "Error retrieving data", error.message);
  }
};

const getDriverById = async (req, res) => {
  try {
    const data = await dbUtils.fetchFromDBById(
      user,
      {
        _id: req.user._id,
      },
      {
        _id: 1,
        role: 1,
        name: 1,
        email: 1,
        phone: 1,
        location: 1,
        lastLoggedIn: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Driver Profile" } }
    );
    return __.successMsg(req, res, 200, data, "Data retrieved successfully");
  } catch (error) {
    console.error(error);
    return __.errorMsg(req, res, 500, "Error retrieving data", error.message);
  }
};

const resetPassword = async (req, res) => {
  try {
    const sessionData = await session.create({
      activities: ["Password Reset Initiated"],
      loginTime: new Date(),
    });
    const { newPassword, email, role } = req.body;
    const filter = { email: email, role: role };
    const checkUser = await dbUtils.findOneDataInDB(user, filter);
    if (!checkUser) {
      return __.customErrMsg(req, res, 404, "User not found, please register");
    }
    const saltRounds = parseInt(process.env.SALT_ROUNDS);
    const salt = await bcrypt.genSalt(saltRounds);
    const newEncryptedPassword = await bcrypt.hash(newPassword, salt);
    const updateResult = await dbUtils.updateOneDataInDB(
      user,
      filter,
      {
        $set: {
          password: newEncryptedPassword,
        },
      },
      {
        _id: 1,
        name: 1,
        email: 1,
        password: 1,
        createdAt: 1,
        updatedAt: 1,
      }
    );
    const updateSession = await session.findOneAndUpdate(
      { _id: sessionData._id },
      {
        $push: {
          activities: `Password has been Reset by User ID - ${updateResult._id}`,
        },
        $set: {
          userId: updateResult._id,
          logoutTime: new Date(),
        },
      },
      {
        new: true,
        projection: {
          _id: 1,
          userId: 1,
          activities: 1,
          loginTime: 1,
          logoutTime: 1,
        },
      }
    );
    console.log("updateSession", updateSession);
    const diff_in_ms = await diffInMS(
      updateSession.loginTime,
      updateSession.logoutTime
    );
    const formattedDiff = await formatMS(diff_in_ms);
    console.log("formattedDiff", formattedDiff);
    await session.updateOne(
      { _id: updateSession._id },
      { $set: { sessionTime: formattedDiff } }
    );
    return __.successMsg(
      req,
      res,
      200,
      updateResult,
      "Password has been reset successfully"
    );
  } catch (error) {
    console.log(error);
    return __.errorMsg(
      req,
      res,
      503,
      "Something went wrong in resetting password",
      error.message
    );
  }
};

const deleteUser = async (req, res) => {
  try {
    const userId = req.user._id;
    const checkUser = await dbUtils.findOneDataInDB(user, {
      _id: userId,
    });
    if (!checkUser) {
      return __.customErrMsg(req, res, 404, "User not found");
    }
    let deletedData = await dbUtils.deleteDataFromDB(user, {
      _id: userId,
    });
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "User Deletion" } }
    );
    return __.successMsg(
      req,
      res,
      204,
      deletedData,
      "Account has been deleted successfully"
    );
  } catch (error) {
    console.log(error);
    return __.errorMsg(req, res, 503, "Something went wrong", error.message);
  }
};

const logout = async (req, res) => {
  try {
    const { email } = req.body;
    const checkUser = await dbUtils.findOneDataInDB(
      user,
      {
        _id: req.user._id,
        email: email,
        role: req.user.role,
      },
      {
        email: 1,
        loginCount: 1,
        logoutCount: 1,
        loggedOut: 1,
      }
    );
    const validate = await userConditions.logoutStage(email, req.user);
    if (validate) {
      return __.customErrMsg(req, res, validate.status, validate.message);
    }
    const updateResult = await dbUtils.updateDataInDB(
      user,
      { _id: req.user._id },
      {
        $set: {
          jwToken: "",
          loggedOut: true,
          logoutCount: parseInt(checkUser.logoutCount) + 1,
        },
      },
      {
        name: 1,
        email: 1,
        loggedOut: 1,
        logoutCount: 1,
      }
    );
    const data = await dbUtils.updateOneDataInDB(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Logout" }, $set: { logoutTime: new Date() } },
      {
        _id: 1,
        loginTime: 1,
        logoutTime: 1,
      }
    );
    const diff_in_ms = await diffInMS(data.loginTime, data.logoutTime);
    const format_ms = await formatMS(diff_in_ms);
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $set: { sessionTime: format_ms } }
    );
    return __.successMsg(
      req,
      res,
      201,
      updateResult,
      `Dear ${req.user.name}, you have been successfully Logged out`
    );
  } catch (error) {
    console.log(error);
    return __.errorMsg(req, res, 503, "Something went wrong", error.message);
  }
};

module.exports = {
  register,
  login,
  sendOTP,
  updateDetails,
  getDriverById,
  getUserById,
  userListing,
  driverListing,
  verifyEmail,
  resetPassword,
  deleteUser,
  logout,
};
