import { useEffect } from "react";
import { useAppDispatch, useAppSelector } from "../store";
import { initializeAuth } from "../store/authSlice";
import { useNavigate, useLocation } from "react-router-dom";

interface AuthProviderProps {
  children: React.ReactNode;
}

const publicRoutes = ["/login", "/register"];

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { isInitialized, isAuthenticated, loading } = useAppSelector(
    (state) => state.auth
  );

  useEffect(() => {
    dispatch(initializeAuth());
  }, [dispatch]);

  useEffect(() => {
    if (isInitialized && !loading) {
      const isPublicRoute = publicRoutes.includes(location.pathname);

      if (!isAuthenticated && !isPublicRoute) {
        // Redirect to login if not authenticated and trying to access private route
        navigate("/login", { replace: true });
      } else if (isAuthenticated && isPublicRoute) {
        // Redirect to dashboard if authenticated and trying to access public route
        navigate("/", { replace: true });
      }
    }
  }, [isInitialized, isAuthenticated, loading, location.pathname, navigate]);

  // Show loading screen while checking authentication
  if (!isInitialized || loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-gray-100">
        <div className="animate-pulse space-y-4">
          <div className="h-12 w-12 rounded-full bg-blue-400 mx-auto"></div>
          <div className="h-4 w-32 bg-blue-400 rounded"></div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default AuthProvider;
