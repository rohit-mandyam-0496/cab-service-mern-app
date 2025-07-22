const { pipe } = require("ramda");

// getting all the middleware packages
const cors = require("./cors");
const bodyParser = require("./bodyParser");
const logger = require("./logger");
const helmet = require("./helmet");

// exporting the entire modules
module.exports = (app) => {
  return pipe(cors, bodyParser, helmet, logger)(app);
};
