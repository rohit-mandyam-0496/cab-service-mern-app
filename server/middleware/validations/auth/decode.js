const decodeCheck = async (authHeader, token, authUser, secretKey) => {
  try {
    if (!authHeader) {
      return {
        status: 400,
        message: "No token",
      };
    }
    if (!secretKey) {
      return {
        status: 400,
        message: "Token secret is not set",
      };
    }
    if (!authHeader.startsWith("Bearer")) {
      return {
        status: 401,
        message: "Not authorized",
      };
    }
    if (authUser.loggedOut) {
      return {
        status: 401,
        message: "User is not logged in",
      };
    }
    if (authUser.jwToken !== token) {
      return {
        status: 403,
        message: "Illegal use of token",
      };
    }
  } catch (error) {
    console.log(error);
    throw error;
  }
};

module.exports = { decodeCheck };
