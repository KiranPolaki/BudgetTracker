import React from "react";

import Spinner from "./Spinner";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
  textColor = "",
  loading = false,
  className = "",
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-semibold shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors duration-200 cursor-pointer";

  const variantStyles = {
    primary: `bg-[#0047C1] ${
      textColor || "text-white"
    } hover:bg-blue-700 focus:ring-white border-transparent`,
    secondary: `bg-gray-800 ${
      textColor || "text-white"
    } border border-gray-700 hover:bg-gray-700 focus:ring-gray-500`,
    outline: `bg-black ${
      textColor || "text-white"
    } border border-white hover:bg-white hover:text-black focus:ring-white`,
    destructive: `bg-rose-600 ${
      textColor || "text-white"
    } border border-rose-500 hover:bg-rose-500 focus:ring-rose-400`,
  };

  const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";
  const widthStyles = fullWidth ? "w-full" : "";

  const classes = `${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${widthStyles} ${className}`;

  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={isDisabled}
      aria-busy={loading}
      className={classes}
    >
      {loading ? (
        <span className="flex items-center gap-2">
          <Spinner />
          <span>{children}</span>
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
