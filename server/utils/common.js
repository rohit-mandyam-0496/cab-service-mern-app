const moment = require("moment");

const stringUpperCase = (a) => {
  try {
    const res = a.toString().toUpperCase();
    return res;
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

// convert date string in MM-DD-YYYY H:mm AM/PM to DD-MM-YYYY H:mm AM/PM
const convertDateFormat = async (dateString) => {
  try {
    const parsedDate = moment(dateString, "MM-DD-YYYY hh:mm A");
    if (!parsedDate.isValid()) {
      return "Invalid Date";
    }
    return parsedDate.format("DD-MM-YYYY hh:mm A");
  } catch (error) {
    console.log(error);
    throw new Error(error);
  }
};

module.exports = {
  stringUpperCase,
  convertDateFormat,
};
