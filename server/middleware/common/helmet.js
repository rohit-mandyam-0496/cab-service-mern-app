const helmet = require('helmet');

// exporting the module 
module.exports = (app) => {
  app.use(helmet());
  console.log("helmet middleware loaded");
  return app;
};
