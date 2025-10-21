import { useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import type { RootState } from "../store";
import {
  createTransaction,
  updateTransaction,
} from "../store/transactionSlice";
import type { Transaction, Category } from "../types";

interface TransactionFormProps {
  transaction?: Transaction;
  onComplete: () => void;
  onCancel: () => void;
}

export default function TransactionForm({
  transaction,
  onComplete,
  onCancel,
}: TransactionFormProps) {
  const dispatch = useAppDispatch();
  const categories = useSelector((state: RootState) => state.categories.items);
  const { isSubmitting, submitError } = useSelector(
    (state: RootState) => state.transactions
  );

  const [formData, setFormData] = useState({
    amount: transaction?.amount.toString() || "",
    description: transaction?.description || "",
    date: transaction?.date || new Date().toISOString().split("T")[0],
    categoryId: transaction?.category.id.toString() || "",
    type: transaction?.type || "EXPENSE",
  });

  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!Array.isArray(categories)) {
      setError("Categories not loaded. Please try again.");
      return;
    }

    const selectedCategory = categories.find(
      (cat: Category) => cat.id === parseInt(formData.categoryId)
    );
    if (!selectedCategory) {
      setError("Please select a valid category");
      return;
    }

    const transactionData = {
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      type: formData.type,
    };

    try {
      if (transaction) {
        await dispatch(
          updateTransaction({
            id: transaction.id,
            data: {
              ...transactionData,
              category: selectedCategory,
            },
          })
        );
      } else {
        await dispatch(
          createTransaction({
            ...transactionData,
            category: selectedCategory,
          })
        );
      }
      onComplete();
    } catch (err) {
      setError(
        `Failed to save transaction: ${
          err instanceof Error ? err.message : "Unknown error"
        }`
      );
    }
  };

  const filteredCategories = Array.isArray(categories)
    ? categories.filter((cat: Category) => cat.type === formData.type)
    : [];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {(error || submitError) && (
        <div className="bg-red-50 text-red-700 p-3 rounded">
          {error || submitError}
        </div>
      )}

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Type
          </label>
          <select
            value={formData.type}
            onChange={(e) =>
              setFormData((prev) => ({
                ...prev,
                type: e.target.value as "INCOME" | "EXPENSE",
                categoryId: "", // Reset category when type changes
              }))
            }
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="EXPENSE">Expense</option>
            <option value="INCOME">Income</option>
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Amount
          </label>
          <input
            type="number"
            step="0.01"
            required
            value={formData.amount}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, amount: e.target.value }))
            }
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            placeholder="0.00"
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <input
          type="text"
          required
          value={formData.description}
          onChange={(e) =>
            setFormData((prev) => ({ ...prev, description: e.target.value }))
          }
          className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          placeholder="Enter description"
        />
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            required
            value={formData.categoryId}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, categoryId: e.target.value }))
            }
            disabled={!Array.isArray(categories)}
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          >
            <option value="">Select a category</option>
            {filteredCategories.map((category: Category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Date
          </label>
          <input
            type="date"
            required
            value={formData.date}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, date: e.target.value }))
            }
            className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="flex justify-end space-x-3 pt-4">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSubmitting}
          className={`px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
            isSubmitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {isSubmitting ? (
            <span className="inline-flex items-center">
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              {transaction ? "Updating..." : "Adding..."}
            </span>
          ) : (
            `${transaction ? "Update" : "Add"} Transaction`
          )}
        </button>
      </div>
    </form>
  );
}
