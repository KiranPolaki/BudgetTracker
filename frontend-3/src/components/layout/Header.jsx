import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium ${
      isActive ? "text-indigo-600" : "text-gray-500 hover:text-gray-700"
    }`;

  return (
    <header className="bg-white shadow-sm">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-xl font-bold text-indigo-600">
                BudgetApp
              </span>
            </div>
            <nav className="hidden md:ml-10 md:flex md:space-x-8">
              <NavLink to="/" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/transactions" className={navLinkClass}>
                Transactions
              </NavLink>
              <NavLink to="/budget" className={navLinkClass}>
                Budget
              </NavLink>
            </nav>
          </div>
          <div className="flex items-center">
            <span className="mr-4 text-sm text-gray-600">
              Welcome, {user?.username || "User"}
            </span>
            <Button onClick={handleLogout} variant="secondary">
              Logout
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
