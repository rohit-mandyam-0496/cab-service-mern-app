/* eslint-disable import/no-anonymous-default-export */
import API from "./api";

const fetchAllAreas = async (params, token) => {
  try {
    const config = {};
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const response = await API.get("/api/v1/area/all", { params, ...config });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

const fetchOneArea = async (params, token) => {
  try {
    const config = {};
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const response = await API.get("/api/v1/area/getOne", { params, ...config });
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

const addArea = async (areaData, token) => {
  try {
    const config = {};
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const response = await API.post("/api/v1/area/add", areaData, ...config);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

const updateArea = async (areaId, areaData, token) => {
  try {
    const config = {};
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const response = await API.put(
      `/api/v1/area/update/${areaId}`,
      areaData,
      ...config
    );
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

const deleteArea = async (areaId, token) => {
  try {
    const config = {};
    if (token) {
      config.headers = {
        Authorization: `Bearer ${token}`,
      };
    }
    const response = await API.delete(`/api/v1/area/delete/${areaId}`, ...config);
    return response.data;
  } catch (error) {
    throw error.response ? error.response.data : error;
  }
};

export default {
  fetchAllAreas,
  fetchOneArea,
  addArea,
  updateArea,
  deleteArea,
};
