import { configureStore, combineReducers } from "@reduxjs/toolkit";
import {
  type TypedUseSelectorHook,
  useDispatch,
  useSelector,
} from "react-redux";
import authReducer from "./authSlice";
import transactionReducer from "./transactionSlice";
import categoryReducer from "./categorySlice";
import budgetReducer from "./budgetSlice";

const rootReducer = combineReducers({
  auth: authReducer,
  transactions: transactionReducer,
  categories: categoryReducer,
  budgets: budgetReducer,
});

export const store = configureStore({
  reducer: rootReducer,
});

export type RootState = ReturnType<typeof rootReducer>;
export type AppDispatch = typeof store.dispatch;

// Create typed hooks
export const useAppDispatch = () => useDispatch<AppDispatch>();
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;
