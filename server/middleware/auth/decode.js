const jwt = require("jsonwebtoken");
const __ = require("../../utils/responseUtil");
const user = require("../../models/user");
const queryHelper = require("../../db/dbUtils");
const { decodeCheck } = require("../validations/auth/decode");
const dotEnv = require("dotenv");
dotEnv.config();

const decodeToken = async (req, res, next) => {
  try {
    const secret_key = process.env.JWT_SECRET;
    const authorization = req.headers.authorization;
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, secret_key);
    req.user = await queryHelper.fetchFromDB(
      user,
      {
        email: decoded.email,
      },
      {
        _id: 1,
        name: 1,
        email: 1,
        phone: 1,
        role: 1,
        jwToken: 1,
      }
    );
    const validate = await decodeCheck(
      authorization,
      token,
      req.user.jwToken,
      secret_key
    );
    if (validate) {
      return __.errorMsg(req, res, 401, validate.message);
    }
    next();
  } catch (error) {
    return __.errorMsg(
      req,
      res,
      401,
      "Not authorized, token verification failed",
      error.message
    );
  }
};

module.exports = { decodeToken };
