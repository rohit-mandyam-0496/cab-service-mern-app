const createBooking = async (fromPlace, toPlace) => {
  if (!fromPlace || !toPlace) {
    return {
      message: "Unservicable location",
    };
  }
  if (fromPlace.state !== toPlace.state) {
    return {
      message: "Outstation travelling is not servicable at this time",
    };
  }
  if (fromPlace.isActive == false || toPlace.isActive == false) {
    return {
      message: "Location not servicable at this time",
    };
  }
};

module.exports = { createBooking };
