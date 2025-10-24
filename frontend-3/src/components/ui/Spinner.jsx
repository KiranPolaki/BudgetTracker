import React from "react";

const Spinner = () => {
  return (
    <div
      className="h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent"
      role="status"
    >
      <span className="sr-only">Loading...</span>
    </div>
  );
};

export default Spinner;
