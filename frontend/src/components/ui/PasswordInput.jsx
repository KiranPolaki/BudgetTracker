import React, { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import toast from "react-hot-toast";

const PasswordInput = ({
  id,
  name,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const isError = required && touched && !value;

  const baseStyles =
    "block w-full rounded-md px-3 py-2 sm:text-sm bg-zinc-900 text-white placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0 pr-10";

  const normalStyles =
    "border border-zinc-700 focus:border-white focus:ring-white";
  const errorStyles =
    "border border-red-500 focus:border-red-500 focus:ring-red-500";

  const handleChange = (e) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length >= maxLength) {
      if (!limitReached) {
        toast.error(`Too long — maximum ${maxLength} characters`);
        setLimitReached(true);
      }
      e.target.value = newValue.slice(0, maxLength);
      onChange({
        ...e,
        target: { ...e.target, value: newValue.slice(0, maxLength) },
      });
    } else {
      setLimitReached(false);
      onChange(e);
    }
  };

  return (
    <div className="flex flex-col">
      <div className="relative">
        <input
          id={id}
          name={name}
          type={showPassword ? "text" : "password"}
          value={value}
          onChange={handleChange}
          onBlur={() => setTouched(true)}
          placeholder={placeholder}
          maxLength={maxLength}
          className={`${baseStyles} ${isError ? errorStyles : normalStyles}`}
          {...props}
        />
        <button
          type="button"
          onClick={() => setShowPassword(!showPassword)}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-zinc-400 hover:text-zinc-300 transition"
          tabIndex="-1"
        >
          {showPassword ? (
            <EyeOff className="w-5 h-5" />
          ) : (
            <Eye className="w-5 h-5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PasswordInput;
