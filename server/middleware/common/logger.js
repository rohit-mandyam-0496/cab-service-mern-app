const morgan = require('morgan');

module.exports = (app) => {
  app.use(morgan('dev'));
  console.log("logger middleware loaded");
  return app;
};
