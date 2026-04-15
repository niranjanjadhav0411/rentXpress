import api from "./api";

export const getAllCars = async () => {
  try {
    const response = await api.get("/cars");
    return response.data;
  } catch (error) {
    console.error(
      "Error fetching cars:",
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Failed to fetch cars");
  }
};

export const getCarById = async (id) => {
  if (!id) {
    throw new Error("Car ID is required");
  }

  try {
    const response = await api.get(`/cars/${id}`);
    return response.data;
  } catch (error) {
    console.error(
      `Error fetching car with ID ${id}:`,
      error.response?.data || error.message,
    );
    throw new Error(error.response?.data?.message || "Failed to fetch car");
  }
};
