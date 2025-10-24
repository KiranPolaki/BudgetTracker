import React from "react";
import { Link } from "react-router-dom";

const NotFoundPage = () => {
  return (
    <div className="flex min-h-[calc(100vh-64px)] flex-col items-center justify-center text-center">
      <h1 className="text-6xl font-extrabold text-indigo-600">404</h1>
      <p className="mt-4 text-2xl font-semibold text-gray-800">
        Page Not Found
      </p>
      <p className="mt-2 text-gray-500">
        Sorry, we couldn’t find the page you’re looking for.
      </p>
      <Link
        to="/"
        className="mt-6 inline-flex items-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
      >
        Go back home
      </Link>
    </div>
  );
};

export default NotFoundPage;
