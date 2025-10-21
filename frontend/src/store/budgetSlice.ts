import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { budgetService } from "../services/api";
import type { Budget } from "../types";

interface BudgetState {
  items: Budget[];
  loading: boolean;
  error: string | null;
}

const initialState: BudgetState = {
  items: [],
  loading: false,
  error: null,
};

export const fetchBudgets = createAsyncThunk("budgets/fetchAll", async () => {
  const response = await budgetService.getAll();
  return response;
});

export const createBudget = createAsyncThunk(
  "budgets/create",
  async (budget: Omit<Budget, "id">) => {
    const response = await budgetService.create(budget);
    return response;
  }
);

export const updateBudget = createAsyncThunk(
  "budgets/update",
  async ({ id, data }: { id: number; data: Partial<Budget> }) => {
    const response = await budgetService.update(id, data);
    return response;
  }
);

const budgetSlice = createSlice({
  name: "budgets",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchBudgets.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBudgets.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
      })
      .addCase(fetchBudgets.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch budgets";
      })
      .addCase(createBudget.fulfilled, (state, action) => {
        state.items.push(action.payload);
      })
      .addCase(updateBudget.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      });
  },
});

export default budgetSlice.reducer;
