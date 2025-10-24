import { create } from "zustand";
import { immer } from "zustand/middleware/immer";
import {
  dashboardAPI,
  transactionsAPI,
  categoriesAPI,
  budgetsAPI,
} from "../services/api";

const useStore = create(
  immer((set, get) => ({
    // Auth state
    user: null,
    isAuthenticated: false,
    accessToken: null,
    refreshToken: null,
    isLoading: false,

    // Dashboard state
    dashboard: null,
    dashboardLoading: false,

    // Transactions state
    transactions: [],
    transactionsLoading: false,
    currentPage: 1,
    totalPages: 1,

    // Categories state
    categories: [],
    categoriesLoading: false,

    // Budgets state
    budgets: [],
    currentBudget: null,
    budgetsLoading: false,

    // Toast state
    toasts: [],

    // Actions
    setUser: (user) => set({ user, isAuthenticated: !!user }),

    loadAuthFromStorage: () => {
      const accessToken = localStorage.getItem("accessToken");
      const refreshToken = localStorage.getItem("refreshToken");
      const user = localStorage.getItem("user");

      if (accessToken && refreshToken && user) {
        set({ accessToken, refreshToken, user, isAuthenticated: true });
      }
    },

    // Toast actions
    addToast: (toast) => {
      const id = Date.now() + Math.random();
      set((state) => {
        state.toasts.push({ id, ...toast });
      });
      return id;
    },

    removeToast: (id) => {
      set((state) => {
        state.toasts = state.toasts.filter((t) => t.id !== id);
      });
    },

    login: async (username, password) => {
      set({ isLoading: true });

      try {
        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/auth/login/`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({ username, password }),
          }
        );

        const data = await response.json();

        if (!response.ok) {
          return { success: false, error: data.detail || "Login failed" };
        }

        // Save tokens and user
        set({
          accessToken: data.access,
          refreshToken: data.refresh,
          user: username,
          isAuthenticated: true,
        });

        localStorage.setItem("accessToken", data.access);
        localStorage.setItem("refreshToken", data.refresh);

        return { success: true };
      } catch (error) {
        console.error("Login error:", error);
        return { success: false, error: error.message };
      } finally {
        set({ isLoading: false });
      }
    },

    logout: () => {
      set({ accessToken: null, refreshToken: null, user: null });
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    },

    // Dashboard actions
    fetchDashboard: async () => {
      set({ dashboardLoading: true });
      try {
        const response = await dashboardAPI.get();
        set({ dashboard: response.data, dashboardLoading: false });
      } catch (error) {
        console.error("Error fetching dashboard:", error);
        set({ dashboardLoading: false });
      }
    },

    // Transaction actions
    fetchTransactions: async (params = {}) => {
      set({ transactionsLoading: true });
      try {
        const response = await transactionsAPI.getAll(params);
        set({
          transactions: response.data.results || response.data,
          transactionsLoading: false,
        });
      } catch (error) {
        console.error("Error fetching transactions:", error);
        set({ transactionsLoading: false });
      }
    },

    addTransaction: async (data) => {
      try {
        const response = await transactionsAPI.create(data);
        set((state) => {
          state.transactions.unshift(response.data);
        });
        get().fetchDashboard();
        get().addToast({
          type: "success",
          title: "Success!",
          message: "Transaction added successfully",
        });
        return response.data;
      } catch (error) {
        get().addToast({
          type: "error",
          title: "Error",
          message: "Failed to add transaction",
        });
        throw error;
      }
    },

    updateTransaction: async (id, data) => {
      try {
        const response = await transactionsAPI.update(id, data);
        set((state) => {
          const index = state.transactions.findIndex((t) => t.id === id);
          if (index !== -1) {
            state.transactions[index] = response.data;
          }
        });
        get().fetchDashboard();
        get().addToast({
          type: "success",
          title: "Updated!",
          message: "Transaction updated successfully",
        });
        return response.data;
      } catch (error) {
        get().addToast({
          type: "error",
          title: "Error",
          message: "Failed to update transaction",
        });
        throw error;
      }
    },

    deleteTransaction: async (id) => {
      try {
        await transactionsAPI.delete(id);
        set((state) => {
          state.transactions = state.transactions.filter((t) => t.id !== id);
        });
        get().fetchDashboard();
        get().addToast({
          type: "success",
          title: "Deleted!",
          message: "Transaction deleted successfully",
        });
      } catch (error) {
        get().addToast({
          type: "error",
          title: "Error",
          message: "Failed to delete transaction",
        });
        throw error;
      }
    },

    // Category actions
    fetchCategories: async () => {
      set({ categoriesLoading: true });
      try {
        const response = await categoriesAPI.getAll();
        set({
          categories: response.data.results || response.data,
          categoriesLoading: false,
        });
      } catch (error) {
        console.error("Error fetching categories:", error);
        set({ categoriesLoading: false });
      }
    },

    addCategory: async (data) => {
      const response = await categoriesAPI.create(data);
      set((state) => {
        state.categories.push(response.data);
      });
      return response.data;
    },

    createDefaultCategories: async () => {
      const response = await categoriesAPI.createDefaults();
      set({ categories: response.data.categories });
      return response.data;
    },

    // Budget actions
    fetchCurrentBudget: async () => {
      set({ budgetsLoading: true });
      try {
        const response = await budgetsAPI.getCurrent();
        set({ currentBudget: response.data, budgetsLoading: false });
      } catch {
        set({ currentBudget: null, budgetsLoading: false });
      }
    },

    setCurrentBudget: async (amount) => {
      try {
        const response = await budgetsAPI.setCurrent(amount);
        set({ currentBudget: response.data });
        get().fetchDashboard();
        get().addToast({
          type: "success",
          title: "Budget Set!",
          message: "Monthly budget updated successfully",
        });
        return response.data;
      } catch (error) {
        get().addToast({
          type: "error",
          title: "Error",
          message: "Failed to set budget",
        });
        throw error;
      }
    },
  }))
);

export default useStore;
