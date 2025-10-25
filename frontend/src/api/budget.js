import apiClient from "./index";

export const getCurrentBudget = async () => {
  const { data } = await apiClient.get("/budgets/current/");
  return data;
};

export const setCurrentBudget = async ({ amount }) => {
  const { data } = await apiClient.post("/budgets/set_current/", { amount });
  return data;
};
