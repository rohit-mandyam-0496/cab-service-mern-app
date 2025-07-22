const encodeCheck = async (payload, secretKey, token) => {
  if (!payload) {
    const data = {
      message: "Payload is empty or missing required fields",
    };
    return data;
  }
  if (!secretKey) {
    const data = { message: "Token secret is not set" };
    return data;
  }
  if (!token) {
    const data = { message: "Token generation failed" };
    return data;
  }
};

module.exports = { encodeCheck };
