import axios from "axios";

const API_URL = "http://localhost:8081/api/cars";

const getAuthHeader = () => {
  const user = JSON.parse(localStorage.getItem("user"));

  if (!user || !user.token) {
    return {};
  }

  return {
    headers: {
      Authorization: `Bearer ${user.token}`,
    },
  };
};

export const getAllCars = async () => {
  const response = await axios.get(API_URL, getAuthHeader());
  return response.data;
};

export const getCarById = async (id) => {
  const response = await axios.get(`${API_URL}/${id}`, getAuthHeader());
  return response.data;
};
