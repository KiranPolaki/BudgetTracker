import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { categoryService } from "../services/api";
import type { Category } from "../types";

interface CategoryState {
  items: Category[];
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialState: CategoryState = {
  items: [],
  loading: false,
  error: null,
  lastFetched: null,
};

export const fetchCategories = createAsyncThunk<Category[]>(
  "categories/fetchAll",
  async (_, { getState }) => {
    const state = getState() as { categories: CategoryState };
    const now = Date.now();
    const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

    // Return cached data if it's fresh enough
    if (
      state.categories.lastFetched &&
      now - state.categories.lastFetched < CACHE_DURATION
    ) {
      return state.categories.items;
    }

    const response = await categoryService.getAll();
    return response;
  }
);

export const createCategory = createAsyncThunk(
  "categories/create",
  async (category: Omit<Category, "id">) => {
    const response = await categoryService.create(category);
    return response;
  }
);

const categorySlice = createSlice({
  name: "categories",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchCategories.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCategories.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload;
        state.lastFetched = Date.now();
      })
      .addCase(fetchCategories.rejected, (state, action) => {
        state.loading = false;
        state.error = action.error.message || "Failed to fetch categories";
      })
      .addCase(createCategory.fulfilled, (state, action) => {
        state.items.push(action.payload);
      });
  },
});

export default categorySlice.reducer;
