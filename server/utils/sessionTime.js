const moment = require("moment");

const diffInMS = async (loginTime, logoutTime) => {
  const a = new Date(loginTime).getTime();
  const b = new Date(logoutTime).getTime();
  if (a > b) {
    // console.log("this 1");
    // console.log("a", a);
    // console.log("b", b);
    let diff = a - b;
    // console.log("diff", diff);
    return diff;
  } else {
    // console.log("this 2");
    // console.log("a", a);
    // console.log("b", b);
    let diff = b - a;
    // console.log("diff", diff);
    return diff;
  }
};

const formatMS = async (milliSeconds) => {
  const duration = moment.duration(milliSeconds);
  if (milliSeconds >= 3600000) {
    // console.log("to hours");
    // console.log("milliSeconds", milliSeconds);
    // If milliseconds are greater than or equal to 1 hour
    return `${duration.asHours().toFixed(2)} hours`;
  } else if (milliSeconds >= 60000) {
    // console.log("to minutes");
    // console.log("milliSeconds", milliSeconds);
    // If milliseconds are greater than or equal to 1 minute
    return `${duration.asMinutes().toFixed(2)} minutes`;
  } else {
    // console.log("to seconds");
    // console.log("milliSeconds", milliSeconds);
    // If milliseconds are less than 1 minute
    return `${duration.asSeconds().toFixed(2)} seconds`;
  }
};

module.exports = { diffInMS, formatMS };
