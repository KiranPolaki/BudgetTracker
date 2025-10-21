import React, { createContext, useContext, useCallback } from "react";
import { useDispatch } from "react-redux";
import { fetchCategories } from "../store/categorySlice";
import { fetchTransactions } from "../store/transactionSlice";
import { fetchBudgets } from "../store/budgetSlice";
import type { AppDispatch } from "../store";

interface NavigationContextType {
  prefetchRoute: (route: string) => Promise<void>;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const dispatch = useDispatch<AppDispatch>();

  const prefetchRoute = useCallback(
    async (route: string) => {
      // Start prefetching data based on the route
      switch (route) {
        case "/dashboard":
          await Promise.all([
            dispatch(fetchCategories()),
            dispatch(
              fetchTransactions({
                page: 1,
                filters: {
                  start_date: new Date(
                    new Date().setMonth(new Date().getMonth() - 6)
                  )
                    .toISOString()
                    .split("T")[0],
                },
              })
            ),
            dispatch(fetchBudgets()),
          ]);
          break;
        case "/transactions":
          await Promise.all([
            dispatch(fetchCategories()),
            dispatch(fetchTransactions({ page: 1, filters: {} })),
          ]);
          break;
        case "/budget":
          await Promise.all([
            dispatch(fetchCategories()),
            dispatch(fetchBudgets()),
            dispatch(
              fetchTransactions({
                page: 1,
                filters: {
                  month: new Date().toISOString().substring(0, 7),
                },
              })
            ),
          ]);
          break;
      }
    },
    [dispatch]
  );

  return (
    <NavigationContext.Provider value={{ prefetchRoute }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const context = useContext(NavigationContext);
  if (!context) {
    throw new Error("useNavigation must be used within a NavigationProvider");
  }
  return context;
}
