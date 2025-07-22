const __ = require("../utils/responseUtil");

const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return __.customErrMsg(
        req,
        res,
        403,
        "Access denied: insufficient permissions"
      );
    }
    next();
  };
};

module.exports = authorizeRoles;
