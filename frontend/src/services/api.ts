import axios from "axios";
import type { Transaction, Category, Budget } from "../types";

const API_URL = "http://localhost:8000/api";

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authService = {
  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login/", { username, password });
    return response.data;
  },
  logout: () => {
    localStorage.removeItem("token");
  },
};

export const transactionService = {
  getAll: async (params?: Record<string, string | number>) => {
    const response = await api.get("/transactions/", { params });
    return response.data;
  },
  create: async (data: Omit<Transaction, "id">) => {
    const response = await api.post("/transactions/", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Omit<Transaction, "id">>) => {
    const response = await api.put(`/transactions/${id}/`, data);
    return response.data;
  },
  delete: async (id: number) => {
    await api.delete(`/transactions/${id}/`);
  },
};

export const categoryService = {
  getAll: async () => {
    const response = await api.get("/categories/");
    return response.data;
  },
  create: async (data: Omit<Category, "id">) => {
    const response = await api.post("/categories/", data);
    return response.data;
  },
};

export const budgetService = {
  getAll: async () => {
    const response = await api.get("/budgets/");
    return response.data;
  },
  create: async (data: Omit<Budget, "id">) => {
    const response = await api.post("/budgets/", data);
    return response.data;
  },
  update: async (id: number, data: Partial<Omit<Budget, "id">>) => {
    const response = await api.put(`/budgets/${id}/`, data);
    return response.data;
  },
};

export default api;
