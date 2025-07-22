const jwt = require("jsonwebtoken");
const dotEnv = require("dotenv");
dotEnv.config();
const { encodeCheck } = require("../validations/auth/encode");
const __ = require("../../utils//responseUtil");

// Function to generate a JWT
const generateToken = async (payload) => {
  try {
    //console.log("payload", payload);
    const secret_key = process.env.JWT_SECRET;
    const token = jwt.sign(payload, secret_key, {
      expiresIn: "5d",
      algorithm: "HS256",
    });
    //console.log("token", token);
    const validate = await encodeCheck(payload, secret_key, token);
    if (validate) {
      return validate.message;
    }
    return token;
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = {
  generateToken,
};
