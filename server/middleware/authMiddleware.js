const jwt = require("jsonwebtoken");
const User = require("../models/user");
const session = require("../models/session");
const { decodeCheck } = require("./validations/auth/decode");
const __ = require("../utils/responseUtil");
const dbUtils = require("../db/dbUtils");

const protect = async (req, res, next) => {
  let token;
  if (req.headers.authorization?.startsWith("Bearer")) {
    try {
      const secret_key = process.env.JWT_SECRET;
      const authorization = req.headers.authorization;
      token = authorization.split(" ")[1];
      const decoded = jwt.verify(token, secret_key);
      console.log("protect decoded", decoded);
      const objectId = await dbUtils.getObjID(decoded._id);
      const user = await User.findOne({ _id: objectId }).select(
        "_id name email phone role jwToken loggedIn"
      );
      const sessionData = await session.findOne({ _id: decoded.sessionId }).select({ _id: 1 });
      req.user = {
        ...user._doc,
        sessionId: sessionData._id,
      } 
      const validate = await decodeCheck(
        authorization,
        token,
        req.user,
        secret_key
      );
      if (validate) {
        return __.errorMsg(req, res, validate.status, validate.message);
      }
      console.log("protect req.user", req.user);
      next();
    } catch (error) {
      console.log(error);
      return __.errorMsg(
        req,
        res,
        401,
        "Not authorized, token verification failed",
        error.message
      );
    }
  } else {
    return __.errorMsg(req, res, 401, "Not authorized, no token");
  }
};

module.exports = { protect };
