const cors = require("cors");
const dotEnv = require("dotenv");
dotEnv.config();

module.exports = (app) => {
  app.use((req, res, next) => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Headers", "*");
    next();
  });
  app.use(
    cors({
      origin: process.env.ORIGIN,
      credentials: true,
    })
  );
  console.log("cors middleware loaded");
  return app;
};
