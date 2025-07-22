const sessionModel = require("../models/session");
const __ = require("../utils/responseUtil");
const dbUtils = require("../db/dbUtils");

const getUserSession = async (req, res) => {
  try {
    // Destructure and validate query parameters
    const { page, limit } = req.query; // Default values
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

    const session = await sessionModel
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $addFields: {
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
            phone: "$user.phone",
          },
        },
        {
          $project: {
            _id: 1,
            loginTime: 1,
            logoutTime: 1,
            sessionTime: 1,
            activities: 1,
            name: 1,
            email: 1,
            role: 1,
            phone: 1,
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
    const totalRecords = await sessionModel.countDocuments();
    if (!session.length) {
      return __.customErrMsg(req, res, 400, "No data found!!!!");
    }
    session.map((data) => {
      if (data.logoutTime === null) {
        data.logoutTime = "Not logged out";
        data.sessionTime = "0 minutes";
      }
    });
    await dbUtils.updateOneDataInDB(
      sessionModel,
      { _id: req.user.sessionId },
      { $push: { activities: "Get User Sessions" } }
    );
    return __.successMsg2(
      req,
      res,
      200,
      session,
      totalRecords,
      "Data fetched successfully"
    );
  } catch (error) {
    console.log(error);
    return __.errorMsg(req, res, 500, "Error fetching data", error.message);
  }
};

const getSelfSessions = async (req, res) => {
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
      //sortObject[req.query.sortField] = req.query.sortOrder === "asc" ? 1 : -1;
    } else {
      sortObject.createdAt = -1; // Default sort by createdAt
    }
    const session = await sessionModel
      .aggregate([
        {
          $lookup: {
            from: "users",
            localField: "userId",
            foreignField: "_id",
            as: "user",
          },
        },
        {
          $unwind: "$user",
        },
        {
          $addFields: {
            userId: "$user._id",
            name: "$user.name",
            email: "$user.email",
            role: "$user.role",
            phone: "$user.phone",
          },
        },
        {
          $project: {
            _id: 1,
            loginTime: 1,
            logoutTime: 1,
            sessionTime: 1,
            activities: 1,
            userId: 1,
            name: 1,
            email: 1,
            role: 1,
            phone: 1,
          },
        },
        {
          $match: { userId: req.user._id, ...searchQuery },
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
    const totalRecords = await sessionModel.countDocuments({
      userId: req.user._id,
    });
    if (!session.length) {
      return __.customErrMsg(req, res, 400, "No data found!!!!");
    }
    session.map((data) => {
      if (data.logoutTime === null) {
        data.logoutTime = "Not logged out";
        data.sessionTime = "0 minutes";
      }
    });
    await dbUtils.updateOneDataInDB(
      sessionModel,
      { _id: req.user.sessionId },
      { $push: { activities: "Get Self Sessions" } }
    );
    return __.successMsg2(
      req,
      res,
      200,
      session,
      totalRecords,
      "Data fetched successfully"
    );
  } catch (error) {
    console.log(error);
    return __.errorMsg(req, res, 500, "Error fetching data", error.message);
  }
};

module.exports = { getUserSession, getSelfSessions };
