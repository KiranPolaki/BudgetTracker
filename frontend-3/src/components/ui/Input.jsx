import React from "react";

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
  const styles =
    "relative block w-full appearance-none rounded-md border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:z-10 focus:border-indigo-500 focus:outline-none focus:ring-indigo-500 sm:text-sm";

  return (
    <input
      id={id}
      name={name}
      type={type}
      required={required}
      className={styles}
      placeholder={placeholder}
      value={value}
      onChange={onChange}
      {...props}
    />
  );
};

export default Input;
