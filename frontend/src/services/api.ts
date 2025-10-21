import axios from "axios";
import type { Transaction, Category, Budget, RegisterData } from "../types";
import type { AxiosResponse } from "axios";

interface CustomError extends Error {
  response?: AxiosResponse;
  request?: unknown;
}

const API_URL = import.meta.env.VITE_API_URL;

// Create axios instance with base configuration
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("accessToken");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Add response interceptor to handle token refresh and error formatting
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle token refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (!refreshToken) {
          throw new Error("Session expired. Please login again.");
        }

        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("accessToken", access);
        originalRequest.headers.Authorization = `Bearer ${access}`;

        return api(originalRequest);
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.dispatchEvent(new CustomEvent("auth:logout"));
        throw new Error("Session expired. Please login again.");
      }
    }

    // Format error messages
    let errorMessage = "An unexpected error occurred";

    if (error.response) {
      // Server responded with error
      if (error.response.data.detail) {
        errorMessage = error.response.data.detail;
      } else if (error.response.data.message) {
        errorMessage = error.response.data.message;
      } else if (
        typeof error.response.data === "object" &&
        Object.keys(error.response.data).length > 0
      ) {
        // Handle form validation errors
        const firstError = Object.entries(error.response.data)[0];
        errorMessage = `${firstError[0]}: ${firstError[1]}`;
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      // Request made but no response
      errorMessage =
        "No response from server. Please check your internet connection.";
    } else {
      // Request setup error
      errorMessage = error.message;
    }

    const customError = new Error(errorMessage) as CustomError;
    customError.response = error.response;
    customError.request = error.request;
    return Promise.reject(customError);
  }
);

export const authService = {
  register: async (data: RegisterData) => {
    const response = await api.post("/auth/register/", data);
    return response.data;
  },

  login: async (username: string, password: string) => {
    const response = await api.post("/auth/login/", { username, password });
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
  },

  refresh: async (refreshToken: string) => {
    const response = await api.post("/auth/refresh/", {
      refresh: refreshToken,
    });
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get("/profile/");
    return response.data;
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
