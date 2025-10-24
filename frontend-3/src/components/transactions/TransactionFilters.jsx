import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../api/category";
import Input from "../ui/Input";
import Button from "../ui/Button";

// Helper function to create the API file if it doesn't exist
// You should create this file: src/api/category.js
// export const getCategories = async () => {
//   const { data } = await apiClient.get('/categories/')
//   return data
// }

const TransactionFilters = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    date_from: "",
    date_to: "",
    amount_min: "",
    amount_max: "",
  });

  const { data: categories } = useQuery({
    queryKey: ["categories"],
    queryFn: getCategories,
  });

  useEffect(() => {
    const handler = setTimeout(() => {
      const activeFilters = Object.fromEntries(
        Object.entries(filters).filter(([, value]) => value !== "")
      );
      onFilterChange(activeFilters);
    }, 500);
    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);

  const handleChange = (e) => {
    setFilters({ ...filters, [e.target.name]: e.target.value });
  };

  const handleReset = () => {
    setFilters({ type: "", category: "", date_from: "", date_to: "" });
    onFilterChange({});
  };

  return (
    <div className="grid grid-cols-1 gap-4 rounded-lg bg-white p-4 shadow sm:grid-cols-2 lg:grid-cols-5">
      <select
        name="type"
        value={filters.type}
        onChange={handleChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">All Types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>

      <select
        name="category"
        value={filters.category}
        onChange={handleChange}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
      >
        <option value="">All Categories</option>
        {categories?.results?.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      <Input
        type="date"
        name="date_from"
        value={filters.date_from}
        onChange={handleChange}
        placeholder="Date From"
      />
      <Input
        type="date"
        name="date_to"
        value={filters.date_to}
        onChange={handleChange}
        placeholder="Date To"
      />

      <Input
        type="number"
        name="amount_min"
        value={filters.amount_min}
        onChange={handleChange}
        placeholder="Min Amount"
      />
      <Input
        type="number"
        name="amount_max"
        value={filters.amount_max}
        onChange={handleChange}
        placeholder="Max Amount"
      />

      <Button onClick={handleReset} variant="secondary">
        Reset
      </Button>
    </div>
  );
};

export default TransactionFilters;
