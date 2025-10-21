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
// import "./App.css";

// Lazy load pages for better performance
import React, { Suspense } from "react";
const Login = React.lazy(() => import("./pages/Login"));
const Register = React.lazy(() => import("./pages/Register"));
const Dashboard = React.lazy(() => import("./pages/Dashboard"));
const Transactions = React.lazy(() => import("./pages/Transactions"));
const Budget = React.lazy(() => import("./pages/Budget"));
const Profile = React.lazy(() => import("./pages/Profile"));
const NotFound = React.lazy(() => import("./pages/NotFound"));

function App() {
  return (
    <Provider store={store}>
      <Router>
        <AuthProvider>
          <NavigationProvider>
            <Suspense fallback={null}>
              <Routes>
                {/* Public Routes */}
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />

                {/* Protected Routes */}
                <Route
                  element={
                    <AuthGuard>
                      <Layout />
                    </AuthGuard>
                  }
                >
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/transactions" element={<Transactions />} />
                  <Route path="/budget" element={<Budget />} />
                  <Route path="/profile" element={<Profile />} />

                  {/* Redirect root to dashboard */}
                  <Route
                    path="/"
                    element={<Navigate to="/dashboard" replace />}
                  />
                </Route>

                {/* Error Routes */}
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
