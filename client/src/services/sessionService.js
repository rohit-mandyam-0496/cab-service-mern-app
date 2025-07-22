/* eslint-disable import/no-anonymous-default-export */
import API from "./api";

const fetchAllSessions = async (params, token) => {
  try {
    const config = {};
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const response = await API.get("/api/v1/sessions/getAll", {
      params,
      ...config,
    });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

const fetchSelfSessions = async (params, token) => {
  try {
    const config = {};
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const response = await API.get("/api/v1/sessions/self", {
      params,
      ...config,
    });
    // console.log("response", response.data);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default {
  fetchAllSessions,
  fetchSelfSessions,
};
