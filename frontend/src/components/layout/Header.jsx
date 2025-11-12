import React, { useState, useRef, useEffect } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/authStore";
import Button from "../ui/Button";
import { Equal, X } from "lucide-react";

const Header = () => {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  const [menuHeight, setMenuHeight] = useState(0);
  const menuRef = useRef(null);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const navLinkClass = ({ isActive }) =>
    `text-sm font-semibold transition-colors duration-200 ${
      isActive ? "text-white" : "text-gray-400 hover:text-gray-100"
    }`;

  useEffect(() => {
    if (menuRef.current) {
      setMenuHeight(menuOpen ? menuRef.current.scrollHeight : 0);
    }
  }, [menuOpen]);

  return (
    <header className="bg-black fixed w-full z-50 shadow-md">
      <div className="mx-auto max-w-7xl px-6 sm:px-8 lg:px-10">
        <div className="flex h-16 items-center justify-between">
          <div className="flex justify-between w-full items-center">
            <div className="flex items-center space-x-2">
              <img src="/budget.svg" className="w-6 h-6" alt="logo" />
            </div>

            <nav className="hidden md:flex space-x-8">
              <NavLink to="/" className={navLinkClass}>
                Dashboard
              </NavLink>
              <NavLink to="/transactions" className={navLinkClass}>
                Transactions
              </NavLink>
              <NavLink to="/budget" className={navLinkClass}>
                Budget
              </NavLink>
              <NavLink to="/categories" className={navLinkClass}>
                Categories
              </NavLink>
            </nav>
            <div className="hidden md:flex items-center space-x-4">
              <span className="text-sm text-gray-300">
                Welcome, {user?.username || "User"}
              </span>
              <Button onClick={handleLogout}>Logout</Button>
            </div>

            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className="md:hidden p-2 text-gray-300"
              aria-label={menuOpen ? "Close Menu" : "Open Menu"}
            >
              {menuOpen ? <X size={24} /> : <Equal size={24} />}
            </button>
          </div>
        </div>

        <div
          ref={menuRef}
          style={{ height: `${menuHeight}px` }}
          className="md:hidden overflow-hidden transition-height duration-300 ease-in-out"
        >
          <nav className="flex flex-col items-center justify-center space-y-2 bg-black/95 p-4 rounded-lg shadow-lg">
            <NavLink
              to="/"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Dashboard
            </NavLink>
            <NavLink
              to="/transactions"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Transactions
            </NavLink>
            <NavLink
              to="/budget"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Budget
            </NavLink>
            <NavLink
              to="/categories"
              className={navLinkClass}
              onClick={() => setMenuOpen(false)}
            >
              Categories
            </NavLink>
            <div className="flex flex-col space-y-2 mt-6 w-full">
              <Button onClick={handleLogout}>Logout</Button>
            </div>
          </nav>
        </div>
      </div>
    </header>
  );
};

export default Header;
