const joi = require("joi");
const __ = require("../../../utils/responseUtil");

const bookingValidations = {
  getAllBookings: joi.object({
    bookingId: joi.string(),
    status: joi.string(),
    pickupTime: joi.string().valid("asc", "desc"),
    fromPlace: joi.string(),
    toPlace: joi.string(),
  }),
  updateBookingStatus: joi.object({
    bookingId: joi.string().required(),
    status: joi
      .string()
      .valid("on-the-way", "completed")
      .required(),
  }),
  createBooking: joi.object({
    from: joi.string().required(),
    to: joi.string().required(),
    pickupTime: joi.string().optional(),
  }),
  userBookings: joi.object({
    status: joi.string(),
  }),
  params: joi.object({
    bookingId: joi.string().required(),
  }),
  validationBody: async (req, res, next) => {
    try {
      const schema = bookingValidations.createBooking;
      const result = schema.validate(req.body, { abortEarly: false });
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
  getUserBookings: async (req, res, next) => {
    try {
      const schema = bookingValidations.userBookings;
      const result = schema.validate(req.body, { abortEarly: false });
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
  update: async (req, res, next) => {
    try {
      const schema = bookingValidations.updateBookingStatus;
      const result = schema.validate(req.body, { abortEarly: false });
      req.query = result.value;
      console.log("error", result.error);
      if (result.error) {
        return __.errorMsg(req, res, 422, result.error.details[0].message);
      }
      return next();
    } catch (error) {
      console.log(error);
      return __.errorMsg(req, res, 400, error.details[0].message, error);
    }
  },
  validationQuery: async (schema, req, res, next) => {
    try {
      const schema = bookingValidations.getAllBookings;
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
  validationParams: async (schema, req, res, next) => {
    try {
      const schema = bookingValidations.params;
      const result = schema.validate(req.params, { abortEarly: false });
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

module.exports = bookingValidations;
