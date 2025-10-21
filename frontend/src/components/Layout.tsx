import { Link, useLocation, useNavigate, Outlet } from "react-router-dom";
import { useDispatch } from "react-redux";
import { logout } from "../store/authSlice";
import type { AppDispatch } from "../store";
import { useNavigation } from "../context/NavigationContext";
import { useState, useEffect } from "react";
import PageSkeleton from "./PageSkeleton";

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { prefetchRoute } = useNavigation();
  const [isNavigating, setIsNavigating] = useState(false);

  const handleLogout = () => {
    dispatch(logout());
    navigate("/login");
  };

  useEffect(() => {
    setIsNavigating(true);
    prefetchRoute(location.pathname).finally(() => {
      setIsNavigating(false);
    });
  }, [location.pathname, prefetchRoute]);

  const navigation = [
    { name: "Dashboard", path: "/dashboard" },
    { name: "Transactions", path: "/transactions" },
    { name: "Budget", path: "/budget" },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Navigation */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex">
              <div className="flex-shrink-0 flex items-center">
                <span className="text-xl font-bold text-blue-600">
                  Budget Tracker
                </span>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.path}
                    to={item.path}
                    className={`${
                      location.pathname === item.path
                        ? "border-blue-500 text-gray-900"
                        : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                    } inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium`}
                  >
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:items-center">
              <button
                onClick={handleLogout}
                className="text-gray-500 hover:text-gray-700 px-3 py-2 rounded-md text-sm font-medium"
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Page Content */}
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          {isNavigating ? <PageSkeleton /> : <Outlet />}
        </div>
      </main>
    </div>
  );
}
