const joi = require("joi");
const __ = require("../../../utils/responseUtil");

const areaValidations = {
  areaBody: joi.object({
    name: joi.string(),
    state: joi.string(),
    location: joi.string(),
    city: joi.string(),
    pinCode: joi.string().min(6).max(6),
    isActice: joi.number().valid(0, 1),
  }),
  areaParams: joi.object({
    areaId: joi.string().required(),
  }),
  areaQuery: joi.object({
    searchField: joi.string(),
    searchValue: joi.string(),
  }),
  validateQuery: async (req, res, next) => {
    try {
      const result = areaValidations.areaQuery.validate(req.query, { abortEarly: false });
      req.query = result.value;
      if (result.error) {
        return __.errorMsg(req, res, 422, result.error.details[0].message);
      }
      return next();
    } catch (error) {
      console.log(error);
      return __.errorMsg(req, res, 400, error.details[0].message, error);
    }
  },
  validateBody: async (req, res, next) => {
    try {
      const result = areaValidations.areaBody.validate(req.body, { abortEarly: false });
      req.query = result.value;
      if (result.error) {
        return __.errorMsg(req, res, 422, result.error.details[0].message);
      }
      return next();
    } catch (error) {
      console.log(error);
      return __.errorMsg(req, res, 400, error.details[0].message, error);
    }
  },
  validateParams: async (req, res, next) => {
    try {
      const result = areaValidations.areaParams.validate(req.params, { abortEarly: false });
      req.query = result.value;
      if (result.error) {
        return __.errorMsg(req, res, 422, result.error.details[0].message);
      }
      return next();
    } catch (error) {
      console.log(error);
      return __.errorMsg(req, res, 400, error.details[0].message, error);
    }
  },
};

module.exports = areaValidations;
