import { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useAppDispatch } from "../store";
import type { RootState } from "../store";
import {
  fetchTransactions,
  setPage,
  deleteTransaction,
} from "../store/transactionSlice";
import { fetchCategories } from "../store/categorySlice";
import Modal from "../components/Modal";
import TransactionForm from "../components/TransactionForm";
import type { Transaction } from "../types";

import ErrorBoundary from "../components/ErrorBoundary";

export default function Transactions() {
  return (
    <ErrorBoundary>
      <TransactionsContent />
    </ErrorBoundary>
  );
}

function TransactionsContent() {
  const dispatch = useAppDispatch();
  const {
    items: transactions,
    loading,
    currentPage,
    totalPages,
  } = useSelector((state: RootState) => state.transactions);
  const categories = useSelector((state: RootState) => state.categories.items);

  const [filters, setFilters] = useState({
    category: "",
    startDate: "",
    endDate: "",
    minAmount: "",
    maxAmount: "",
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTransaction, setSelectedTransaction] =
    useState<Transaction | null>(null);

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const debounceTimeout = setTimeout(() => {
      dispatch(fetchTransactions({ page: currentPage, filters }));
    }, 300); // 300ms debounce

    return () => clearTimeout(debounceTimeout);
  }, [dispatch, currentPage, filters]);

  const handlePageChange = (newPage: number) => {
    dispatch(setPage(newPage));
  };

  const handleFilter = () => {
    dispatch(fetchTransactions({ page: 1, filters }));
  };

  const handleDelete = async (transaction: Transaction) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      await dispatch(deleteTransaction(transaction.id));
      dispatch(fetchTransactions({ page: currentPage, filters }));
    }
  };

  const handleEdit = (transaction: Transaction) => {
    setSelectedTransaction(transaction);
    setIsModalOpen(true);
  };

  const handleModalClose = () => {
    setSelectedTransaction(null);
    setIsModalOpen(false);
  };

  const handleTransactionComplete = () => {
    handleModalClose();
    dispatch(fetchTransactions({ page: currentPage, filters }));
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Transactions</h1>
        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          Add Transaction
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Filters</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={filters.category}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, category: e.target.value }))
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">All Categories</option>
              {Array.isArray(categories)
                ? categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))
                : null}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Start Date
            </label>
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              End Date
            </label>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Amount Range
            </label>
            <div className="flex space-x-2">
              <input
                type="number"
                placeholder="Min"
                value={filters.minAmount}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, minAmount: e.target.value }))
                }
                className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
              <input
                type="number"
                placeholder="Max"
                value={filters.maxAmount}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, maxAmount: e.target.value }))
                }
                className="w-1/2 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>
        <div className="mt-4 text-right">
          <button
            onClick={() =>
              setFilters({
                category: "",
                startDate: "",
                endDate: "",
                minAmount: "",
                maxAmount: "",
              })
            }
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 mr-3"
          >
            Clear Filters
          </button>
          <button
            onClick={handleFilter}
            className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Apply Filters
          </button>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">Loading...</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Description
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Amount
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.map((transaction: Transaction) => (
                <tr key={transaction.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(transaction.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {transaction.description}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {transaction.category.name}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm font-medium text-right ${
                      transaction.type === "INCOME"
                        ? "text-green-600"
                        : "text-red-600"
                    }`}
                  >
                    {transaction.type === "INCOME" ? "+" : "-"}$
                    {transaction.amount.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => handleEdit(transaction)}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(transaction)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="mt-6 flex justify-center">
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === 1
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Previous
          </button>
          {[...Array(totalPages)].map((_, i) => (
            <button
              key={i + 1}
              onClick={() => handlePageChange(i + 1)}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium ${
                currentPage === i + 1
                  ? "z-10 bg-blue-50 border-blue-500 text-blue-600"
                  : "bg-white text-gray-500 hover:bg-gray-50"
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              currentPage === totalPages
                ? "text-gray-300 cursor-not-allowed"
                : "text-gray-500 hover:bg-gray-50"
            }`}
          >
            Next
          </button>
        </nav>
      </div>

      {/* Transaction Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={handleModalClose}
        title={selectedTransaction ? "Edit Transaction" : "Add Transaction"}
      >
        <TransactionForm
          transaction={selectedTransaction || undefined}
          onComplete={handleTransactionComplete}
          onCancel={handleModalClose}
        />
      </Modal>
    </div>
  );
}
