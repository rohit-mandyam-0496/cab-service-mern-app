const registerStage = async (user, email, role, contactNumber) => {
  if (!user) {
    return;
  } else if (user.phone == contactNumber) {
    return {
      status: 403,
      message: "Account with Phone Number already in use. Please login",
    };
  } else if (user.email == email) {
    return {
      status: 403,
      message: "Account with Email ID already in use. Please login",
    };
  } else if (user.role == role) {
    return {
      status: 403,
      message: "Account with Role already in use. Please login",
    };
  }
};

const loginStage = async (user, email, role, checkPassword) => {
  if (user.role != role) {
    return {
      status: 403,
      message: "Login with correct role!!!!!",
    };
  } else if (!checkPassword) {
    return {
      status: 400,
      message: "Invalid password",
    };
  } else if (user.email != email) {
    return {
      status: 400,
      message: "Invalid email",
    };
  }
};

const verifyOTPStage = async (verified, field1, field2, otp) => {
  if (verified) {
    return {
      status: 403,
      message: "Already verified",
    };
  }
  if (otp !== field1) {
    return {
      status: 400,
      message: "Invalid OTP",
    };
  }
  if (field2 < Date.now()) {
    return {
      status: 400,
      message: "OTP has expired",
    };
  }
};

const listingStage = async (data) => {
  if (!data.length) {
    return {
      status: 404,
      message: "No data found",
    };
  }
};

const updateStage = async (user, authUser) => {
  if (!user) {
    return {
      status: 404,
      message: "User not found",
    };
  }
  if (user.email != authUser.email) {
    return {
      status: 401,
      message: "Unauthorized",
    };
  }
};

const logoutStage = async (reqBodyEmail, authUser) => {
  if (reqBodyEmail != authUser.email) {
    return {
      status: 401,
      message: "Unauthorized",
    };
  }
};

module.exports = {
  registerStage,
  loginStage,
  listingStage,
  verifyOTPStage,
  updateStage,
  logoutStage,
};
