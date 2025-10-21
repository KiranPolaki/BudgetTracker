import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { transactionService } from "../services/api";
import type { Transaction } from "../types";

interface TransactionState {
  items: Transaction[];
  loading: boolean;
  error: string | null;
  totalPages: number;
  currentPage: number;
}

const initialState: TransactionState = {
  items: [],
  loading: false,
  error: null,
  totalPages: 1,
  currentPage: 1,
};

export const fetchTransactions = createAsyncThunk(
  "transactions/fetchAll",
  async ({
    page,
    filters,
  }: {
    page: number;
    filters?: Record<string, string | number | boolean>;
  }) => {
    const response = await transactionService.getAll({ page, ...filters });
    return response;
  }
);

export const createTransaction = createAsyncThunk(
  "transactions/create",
  async (transaction: Omit<Transaction, "id">) => {
    const response = await transactionService.create(transaction);
    return response;
  }
);

export const updateTransaction = createAsyncThunk(
  "transactions/update",
  async ({ id, data }: { id: number; data: Partial<Transaction> }) => {
    const response = await transactionService.update(id, data);
    return response;
  }
);

export const deleteTransaction = createAsyncThunk(
  "transactions/delete",
  async (id: number) => {
    await transactionService.delete(id);
    return id;
  }
);

const transactionSlice = createSlice({
  name: "transactions",
  initialState,
  reducers: {
    setPage: (state, action) => {
      state.currentPage = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchTransactions.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchTransactions.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.results;
        state.totalPages = Math.ceil(action.payload.count / 10);
      })
      .addCase(fetchTransactions.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch transactions";
      })
      .addCase(createTransaction.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateTransaction.fulfilled, (state, action) => {
        const index = state.items.findIndex(
          (item) => item.id === action.payload.id
        );
        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteTransaction.fulfilled, (state, action) => {
        state.items = state.items.filter((item) => item.id !== action.payload);
      });
  },
});

export const { setPage } = transactionSlice.actions;
export default transactionSlice.reducer;
