import apiClient from "./index";

export const getDashboardData = async () => {
  const { data } = await apiClient.get("/dashboard/");
  return data;
};

export const getTransactionSummary = async () => {
  const { data } = await apiClient.get("/transactions/summary/");
  return data;
};

export const getTransactionsByCategory = async () => {
  const { data } = await apiClient.get("/transactions/by_category/");
  return data;
};

export const getTransactions = async (params = {}) => {
  const { data } = await apiClient.get("/transactions/", { params });
  return data;
};

export const createTransaction = async (transactionData) => {
  const { data } = await apiClient.post("/transactions/", transactionData);
  return data;
};

export const updateTransaction = async (id, transactionData) => {
  const { data } = await apiClient.put(`/transactions/${id}/`, transactionData);
  return data;
};

export const deleteTransaction = async (id) => {
  await apiClient.delete(`/transactions/${id}/`);
};
