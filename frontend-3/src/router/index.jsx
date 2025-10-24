import React, { Suspense, lazy } from "react";
import { Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import Layout from "../components/layout/Layout";
import Spinner from "../components/ui/Spinner";

const LoginPage = lazy(() => import("../pages/LoginPage"));
const DashboardPage = lazy(() => import("../pages/DashboardPage"));
const TransactionsPage = lazy(() => import("../pages/TransactionsPage"));
const BudgetPage = lazy(() => import("../pages/BudgetPage"));
const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));

const AppRouter = () => {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center">
          <Spinner />
        </div>
      }
    >
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="/" element={<DashboardPage />} />
          <Route path="/transactions" element={<TransactionsPage />} />
          <Route path="/budget" element={<BudgetPage />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
};

export default AppRouter;
