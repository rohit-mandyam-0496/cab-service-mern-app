const rateLimit = require('express-rate-limit');
const dotEnv = require("dotenv");
dotEnv.config();

const LoginRateLimiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW)  * 60 * 1000, // 1 hour
  max: parseInt(process.env.LOGIN_RATE_LIMIT_MAX), // Limit each IP to 1 login per window
  message: 'Too many login requests. Please try again after an hour.',
});

module.exports = { LoginRateLimiter };
