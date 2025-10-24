import React, { useState } from "react";

const Input = ({
  id,
  name,
  type,
  value,
  onChange,
  placeholder,
  required = false,
  ...props
}) => {
  const [touched, setTouched] = useState(false);
  const isError = required && touched && !value;

  const baseStyles =
    "block w-full rounded-md px-3 py-2 sm:text-sm bg-zinc-900 text-white placeholder-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-0";

  const normalStyles =
    "border border-zinc-700 focus:border-white focus:ring-white";
  const errorStyles =
    "border border-red-500 focus:border-red-500 focus:ring-red-500";

  return (
    <div className="flex flex-col">
      <input
        id={id}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={() => setTouched(true)}
        placeholder={placeholder}
        className={`${baseStyles} ${isError ? errorStyles : normalStyles}`}
        {...props}
      />
      {/* {isError && (
        <span className="text-red-500 text-xs mt-1 ml-1">Required</span>
      )} */}
    </div>
  );
};

export default Input;
