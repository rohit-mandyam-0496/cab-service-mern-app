const joi = require("joi");
const __ = require("../../../utils/responseUtil");

const sessionValidations = {
  get: joi.object({
    sessionTime: joi.string().valid("asc", "desc").optional(),
    loginTime: joi.string().valid("asc", "desc").optional(),
    logoutTime: joi.string().valid("asc", "desc").optional(),
    sessionId: joi.string(),
    email: joi.string().valid("").optional(),
    phone: joi.string(),
    activities: joi.string().optional(),
    userId: joi.string(),
    role: joi.string().valid("").optional(),
    page: joi.string(),
    limit: joi.string()
  }),
  query: joi.object({
    page: joi.string(),
    limit: joi.string(),
    searchField: joi.string(),
    searchValue: joi.string(),
    sortField: joi.string(),
    sortOrder: joi.string(),
  }),
  validateQuery: async (req, res, next) => {
    try {
      const schema = sessionValidations.query;
      const result = schema.validate(req.query, { abortEarly: false });
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

module.exports = sessionValidations;
