import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { Provider } from "react-redux";
import { store } from "./store";
import AuthProvider from "./components/AuthProvider";
import AuthGuard from "./components/AuthGuard";
import Layout from "./components/Layout";
import { NavigationProvider } from "./context/NavigationContext";
import React, { Suspense } from "react";

const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Transactions = React.lazy(() => import("./pages/Transactions"));
const Budget = React.lazy(() => import("./pages/Budget"));
const Profile = React.lazy(() => import("./pages/Profile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-3">
      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-sm text-gray-600">Loading...</p>
    </div>
  </div>
);

const ProtectedLayout = React.memo(() => (
  <AuthGuard>
    <Layout />
  </AuthGuard>
));

ProtectedLayout.displayName = "ProtectedLayout";

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <NavigationProvider>
            <Suspense fallback={<PageLoader />}>
              <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route element={<ProtectedLayout />}>
                  <Route index element={<Navigate to="/dashboard" replace />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/profile" element={<Profile />} />
                </Route>
                <Route path="*" element={<NotFound />} />
              </Routes>
            </Suspense>
          </NavigationProvider>
        </AuthProvider>
      </Router>
    </Provider>
  );
}

export default App;
