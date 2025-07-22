const rateLimit = require('express-rate-limit');
const dotEnv = require("dotenv");
dotEnv.config();

const otpRequestRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW), // 1 hour
  max: parseInt(process.env.OTP_RATE_LIMIT_MAX), // Limit each IP to 5 OTP requests per window
  message: 'Too many OTP requests. Please try again after an hour.',
});

module.exports = { otpRequestRateLimiter };
