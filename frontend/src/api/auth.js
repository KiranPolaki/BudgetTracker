import apiClient from "./index";

export const loginUser = async (credentials) => {
  const { data } = await apiClient.post("/auth/login/", credentials);
  return data;
};

export const fetchUserProfile = async () => {
  const { data } = await apiClient.get("/user/");
  return data;
};
