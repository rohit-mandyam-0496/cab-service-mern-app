const mongoose = require("mongoose");

const createDataInDB = async (model, data) => {
  try {
    const result = await model.create(data);
    return result;
  } catch (error) {
    console.error(error);
    throw new Error(error.message);
  }
};

const findOneDataInDB = async (model, filterQuery, fieldsToDisp) => {
  try {
    const result = await model.findOne(filterQuery, fieldsToDisp).lean().exec();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const fetchFromDB = async (
  model,
  filterQuery,
  fieldsToDisp,
  sortQuery,
  skip,
  limit
) => {
  try {
    // implement pagination
    const result = await model
      .find(filterQuery, fieldsToDisp)
      .sort(sortQuery)
      .skip(skip)
      .limit(limit)
      .lean()
      .exec();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const fetchFromDBById = async (model, id) => {
  try {
    const result = await model.findById(id).lean().exec();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const updateDataInDB = async (model, id, data, fieldsToDisp) => {
  try {
    const result = await model
      .findByIdAndUpdate(id, data, { new: true, projection: fieldsToDisp })
      .lean()
      .exec();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const updateOneDataInDB = async (model, filterQuery, data, fieldsToDisp) => {
  try {
    const result = await model
      .findOneAndUpdate(filterQuery, data, {
        new: true,
        projection: fieldsToDisp,
      })
      .lean()
      .exec();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const updateSession = async (model, filterQuery, data) => {
  try {
    const result = await model.findOneAndUpdate(filterQuery, data);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const deleteDataFromDB = async (model, id) => {
  try {
    const result = await model.findByIdAndDelete(id).exec();
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

const getObjID = async (idString) => {
  try {
    const result = new mongoose.Types.ObjectId(idString);
    return result;
  } catch (error) {
    throw new Error(error);
  }
};

module.exports = {
  createDataInDB,
  findOneDataInDB,
  fetchFromDB,
  fetchFromDBById,
  updateDataInDB,
  updateOneDataInDB,
  updateSession,
  deleteDataFromDB,
  getObjID,
};
