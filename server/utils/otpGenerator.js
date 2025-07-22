const crypto = require("crypto");

const generateOTP = async (ttl) => {
  try {
    const ttlInt = parseInt(ttl);
    const otpTtl = ttlInt * 60 * 1000;
    const now = new Date().getTime();
    const expiryTime = new Date(now + otpTtl);
    // console.log('ttl', ttl);
    // console.log('otpTtl', otpTtl);
    // console.log('now', now);
    // console.log('expiryTime', expiryTime);
    const randomInt = crypto.randomInt(100000, 999999);
    const otp = randomInt.toString();
    // return data in object
    let data = { otp, expiryTime };
    return data;
  } catch (err) {
    console.err(err);
    throw new Error(err);
  }
};

module.exports = { generateOTP };
