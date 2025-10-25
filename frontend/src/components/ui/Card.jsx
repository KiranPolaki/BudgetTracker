import React from "react";

const Card = ({ children, className = "" }) => {
  return (
    <div className={`overflow-hidden rounded-lg bg-white shadow ${className}`}>
      <div className="p-5">{children}</div>
    </div>
  );
};

export default Card;
