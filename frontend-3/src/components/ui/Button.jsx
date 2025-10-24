import React from "react";

const Button = ({
  children,
  onClick,
  type = "button",
  variant = "primary",
  disabled = false,
  fullWidth = false,
}) => {
  const baseStyles =
    "inline-flex items-center justify-center rounded-md border px-4 py-2 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2";
  const variantStyles = {
    primary:
      "border-transparent bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500",
    secondary:
      "border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-indigo-500",
  };
  const disabledStyles = "disabled:opacity-50 disabled:cursor-not-allowed";
  const widthStyles = fullWidth ? "w-full" : "";

  const classes = `${baseStyles} ${variantStyles[variant]} ${disabledStyles} ${widthStyles}`;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={classes}
    >
      {children}
    </button>
  );
};

export default Button;
