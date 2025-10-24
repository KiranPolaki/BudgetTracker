import { create } from "zustand";
import { persist } from "zustand/middleware";

export const useAuthStore = create(
  persist(
    (set) => ({
      accessToken: null,
      user: null,
      setToken: (token) => set({ accessToken: token }),
      setUser: (userData) => set({ user: userData }),
      logout: () => set({ accessToken: null, user: null }),
    }),
    {
      name: "auth-storage",
    }
  )
);
