import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { authService } from "../services/api";
import type { AuthState, RegisterData } from "../types";

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null,
  isInitialized: false,
};

export const register = createAsyncThunk(
  "auth/register",
  async (data: RegisterData) => {
    const response = await authService.register(data);
    localStorage.setItem("accessToken", response.tokens.access);
    localStorage.setItem("refreshToken", response.tokens.refresh);
    return response.user;
  }
);

export const login = createAsyncThunk(
  "auth/login",
  async ({ username, password }: { username: string; password: string }) => {
    const response = await authService.login(username, password);
    localStorage.setItem("accessToken", response.access);
    localStorage.setItem("refreshToken", response.refresh);
    return response.user;
  }
);

export const logout = createAsyncThunk("auth/logout", async () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
});

export const initializeAuth = createAsyncThunk("auth/initialize", async () => {
  const accessToken = localStorage.getItem("accessToken");
  const refreshToken = localStorage.getItem("refreshToken");

  if (!accessToken || !refreshToken) {
    throw new Error("No tokens found");
  }

  try {
    // Try to get user profile with current access token
    const user = await authService.getProfile();
    return user;
  } catch (error) {
    // If access token is expired, try to refresh
    try {
      const tokens = await authService.refresh(refreshToken);
      localStorage.setItem("accessToken", tokens.access);
      const user = await authService.getProfile();
      return user;
    } catch (refreshError) {
      // If refresh fails, clear everything
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      throw new Error("Session expired");
    }
  }
});

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Register cases
      .addCase(register.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(register.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(register.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Registration failed";
      })

      // Login cases
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to login";
      })

      // Logout cases
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
        state.isAuthenticated = false;
      })

      // Initialize auth cases
      .addCase(initializeAuth.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(initializeAuth.fulfilled, (state, action) => {
        state.loading = false;
        state.isAuthenticated = true;
        state.user = action.payload;
        state.isInitialized = true;
      })
      .addCase(initializeAuth.rejected, (state) => {
        state.loading = false;
        state.isInitialized = true;
      });
  },
});

export const { clearError } = authSlice.actions;
export default authSlice.reducer;
