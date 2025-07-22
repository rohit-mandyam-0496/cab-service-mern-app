const joi = require("joi");
const __ = require("../../../utils/responseUtil");

const userValidations = {
  register: async (req, res, next) => {
    try {
      let email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const schema = joi.object().keys({
        role: joi.string().valid("admin", "customer", "driver").required(),
        name: joi.string().required(),
        contactNumber: joi.string().min(10).max(10).required(),
        email: joi.string().regex(email_regex).required(),
        password: joi.string().min(8).required(),
      });
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
  login: async (req, res, next) => {
    try {
      let email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const schema = joi.object().keys({
        role: joi.string().valid("admin", "customer", "driver").required(),
        email: joi.string().regex(email_regex).required(),
        password: joi.string().required(),
      });
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
  verifyEmail: async (req, res, next) => {
    try {
      const schema = joi.object().keys({
        otp: joi.string().required(),
      });
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
      const schema = joi.object().keys({
        email: joi.string().required(),
        name: joi.string().required(),
        phone: joi.string().min(10).max(10).required(),
      });
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
  resetPassword: async (req, res, next) => {
    try {
      let email_regex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
      const schema = joi.object().keys({
        role: joi.string().valid("admin", "customer", "driver").required(),
        email: joi.string().regex(email_regex).required(),
        newPassword: joi.string().min(8).required(),
      });
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
  logout: async (req, res, next) => {
    try {
      const schema = joi.object().keys({
        email: joi.string().required(),
      });
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
  deleteUser: async (req, res, next) => {
    try {
      const schema = joi.object().keys({
        userId: joi.string().required(),
      });
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

module.exports = userValidations;
