import api from "./api";

export const loginUser = async (credentials) => {
  const res = await api.post("/auth/login", credentials);

  const accessToken = res.data?.accessToken;

  if (!accessToken) {
    throw new Error("Token not received from server");
  }

  return accessToken;
};
