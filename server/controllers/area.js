const area = require("../models/area");
const session = require("../models/session");
const __ = require("../utils/responseUtil");
const dbUtils = require("../db/dbUtils");
//const areaConditions = require("../middleware/validations/data/areaConditions");

const addArea = async (req, res) => {
  try {
    const { name, location, city, state, pinCode } = req.body;
    const areaData = {
      name,
      location,
      city,
      state,
      pinCode,
    };
    const result = await dbUtils.createDataInDB(area, areaData);
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Area Addition" } }
    );
    return __.successMsg(req, res, 200, result, "Area added successfully");
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error adding area", err.message);
  }
};

const fetchOneArea = async (req, res) => {
  try {
    const searchQuery = {};
    if (req.query.searchField && req.query.searchValue) {
      searchQuery[req.query.searchField] = new RegExp(
        req.query.searchValue,
        "i"
      );
    }
    const result = await dbUtils.findOneDataInDB(
      area,
      {
        ...searchQuery,
      },
      { name: 1, location: 1, city: 1, state: 1, pinCode: 1 }
    );
    if (!result) {
      return __.customErrMsg(req, res, 404, "Area not found");
    }
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Area Fetch" } }
    );
    return __.successMsg(req, res, 200, result, "Area found successfully");
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error fetching area", err.message);
  }
};

const fetchAllAreas = async (req, res) => {
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
    const projectFields = {
      name: 1,
      location: 1,
      city: 1,
      state: 1,
      pinCode: 1,
    };
    // Fetch areas from the database
    const result = await area
      .find(searchQuery)
      .select(projectFields)
      .sort(sortObject)
      .skip(Number(skip))
      .limit(Number(limit))
      .lean()
      .exec();
    const totalRecords = await area.countDocuments();
    // Check if any areas were found
    if (result.length === 0) {
      return __.customErrMsg(req, res, 404, "Areas not found");
    }
    // Update user session activities
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Area Fetch All" } }
    );
    // Return success response
    return __.successMsg2(req, res, 200, result, totalRecords, "Areas found successfully");
  } catch (err) {
    console.error(err); // Log the error for debugging
    return __.errorMsg(req, res, 500, "Error fetching areas", err.message);
  }
};

const updateArea = async (req, res) => {
  try {
    let objectId = await dbUtils.getObjID(req.params.areaId);
    const { name, location, city, state, pinCode, isActive } = req.body;
    const findArea = await area.findOne({ _id: objectId });
    if (!findArea) {
      return __.customErrMsg(req, res, 404, "Area not found");
    }
    let data = await dbUtils.updateDataInDB(
      area,
      {
        _id: objectId,
      },
      {
        $set: {
          name: name,
          location: location,
          city: city,
          state: state,
          pinCode: pinCode,
          isActive: isActive,
        },
      },
      { name: 1, location: 1, city: 1, state: 1, pinCode: 1, isActive: 1 }
    );
    await dbUtils.updateSession(
      session,
      { _id: req.user.sessionId, userId: req.user._id },
      { $push: { activities: "Area Details Update" } }
    );
    return __.successMsg(
      req,
      res,
      200,
      data,
      "Area status updated successfully"
    );
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error updating area", err.message);
  }
};

const deleteArea = async (req, res) => {
  try {
    const areaId = req.params.areaId;
    const objectId = await dbUtils.getObjID(areaId);
    const result = await dbUtils.deleteDataFromDB(area, {
      _id: objectId,
    });
    await dbUtils.updateOneDataInDB(
      session,
      { _id: req.user.sessionId },
      { $push: { activities: "Area Deletion" } }
    );
    return __.successMsg(req, res, 200, result, "Area deleted successfully");
  } catch (err) {
    console.log(err);
    return __.errorMsg(req, res, 500, "Error deleting area", err.message);
  }
};

module.exports = {
  addArea,
  fetchOneArea,
  updateArea,
  fetchAllAreas,
  deleteArea,
};
