import React, { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { getCategories } from "../../api/category";
import Input from "../ui/Input";
import Button from "../ui/Button";

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
        Object.entries(filters).filter(([, v]) => v !== "")
      );
      onFilterChange(activeFilters);
    }, 400);
    return () => clearTimeout(handler);
  }, [filters, onFilterChange]);

  const handleChange = (e) =>
    setFilters({ ...filters, [e.target.name]: e.target.value });

  const handleReset = () => {
    setFilters({
      type: "",
      category: "",
      date_from: "",
      date_to: "",
      amount_min: "",
      amount_max: "",
    });
    onFilterChange({});
  };

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5 bg-zinc-900 border border-zinc-800 rounded-xl p-4">
      <select
        name="type"
        value={filters.type}
        onChange={handleChange}
        className="rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm p-2 focus:ring-blue-500"
      >
        <option value="">All Types</option>
        <option value="INCOME">Income</option>
        <option value="EXPENSE">Expense</option>
      </select>

      <select
        name="category"
        value={filters.category}
        onChange={handleChange}
        className="rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 text-sm p-2 focus:ring-blue-500"
      >
        <option value="">All Categories</option>
        {categories?.results?.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {cat.name}
          </option>
        ))}
      </select>

      {/* <Input
        type="date"
        name="date_from"
        value={filters.date_from}
        onChange={handleChange}
      />
      <Input
        type="date"
        name="date_to"
        value={filters.date_to}
        onChange={handleChange}
      /> */}
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

      <Button variant="secondary" onClick={handleReset}>
        Reset
      </Button>
    </div>
  );
};

export default TransactionFilters;
