import apiClient from "./index";

export const getCurrentBudget = async () => {
  try {
    const { data } = await apiClient.get("/budgets/current/");
    return data;
  } catch (err) {
    if (err.response && err.response.status === 404) return null;
    throw err;
  }
};

export const setCurrentBudget = async ({ amount }) => {
  const { data } = await apiClient.post("/budgets/set_current/", { amount });
  return data;
};
