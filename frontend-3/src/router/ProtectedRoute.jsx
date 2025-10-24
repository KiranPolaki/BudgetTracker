import { Navigate, Outlet } from "react-router-dom";
import { useAuthStore } from "../store/authStore";

export const ProtectedRoute = ({ children }) => {
  const { accessToken } = useAuthStore();

  if (!accessToken) {
    return <Navigate to="/login" replace />;
  }

  return children ? children : <Outlet />;
};
