import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("access_token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refresh_token");
        const response = await axios.post(`${API_URL}/auth/refresh/`, {
          refresh: refreshToken,
        });

        const { access } = response.data;
        localStorage.setItem("access_token", access);

        originalRequest.headers.Authorization = `Bearer ${access}`;
        return api(originalRequest);
      } catch (err) {
        localStorage.removeItem("access_token");
        localStorage.removeItem("refresh_token");
        window.location.href = "/login";
        return Promise.reject(err);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (credentials) => api.post("/auth/login/", credentials),
  register: (userData) => api.post("/auth/register/", userData),
};

// Categories API
export const categoriesAPI = {
  getAll: () => api.get("/categories/"),
  create: (data) => api.post("/categories/", data),
  update: (id, data) => api.put(`/categories/${id}/`, data),
  delete: (id) => api.delete(`/categories/${id}/`),
  createDefaults: () => api.post("/categories/create_defaults/"),
};

// Transactions API
export const transactionsAPI = {
  getAll: (params) => api.get("/transactions/", { params }),
  create: (data) => api.post("/transactions/", data),
  update: (id, data) => api.put(`/transactions/${id}/`, data),
  delete: (id) => api.delete(`/transactions/${id}/`),
  summary: (params) => api.get("/transactions/summary/", { params }),
  byCategory: (params) => api.get("/transactions/by_category/", { params }),
};

// Budgets API
export const budgetsAPI = {
  getAll: () => api.get("/budgets/"),
  create: (data) => api.post("/budgets/", data),
  update: (id, data) => api.put(`/budgets/${id}/`, data),
  delete: (id) => api.delete(`/budgets/${id}/`),
  getCurrent: () => api.get("/budgets/current/"),
  setCurrent: (amount) => api.post("/budgets/set_current/", { amount }),
};

// Dashboard API
export const dashboardAPI = {
  get: () => api.get("/dashboard/"),
};

// User API
export const userAPI = {
  getProfile: () => api.get("/user/"),
};

export default api;
