import React, { useState } from "react";
import toast from "react-hot-toast";

const Input = ({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  maxLength,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const isError = required && touched && !value;

  const baseStyles =
    "block w-full rounded-md px-3 py-2 sm:text-sm bg-zinc-900 text-white placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0";

  const normalStyles =
    "border border-zinc-700 focus:border-white focus:ring-white";
  const errorStyles =
    "border border-red-500 focus:border-red-500 focus:ring-red-500";

  const handleChange = (e) => {
    const newValue = e.target.value;

    if (maxLength && newValue.length >= maxLength) {
      if (!limitReached) {
        toast.error(`Maximum ${maxLength} characters allowed`);
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
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={handleChange}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        maxLength={maxLength}
        className={`${baseStyles} ${isError ? errorStyles : normalStyles}`}
        {...props}
      />
    </div>
  );
};

export default Input;
