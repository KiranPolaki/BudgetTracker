import apiClient from "./index";

export const fetchDashboardData = async () => {
  const { data } = await apiClient.get("/dashboard/");
  return data;
};
