import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import { format } from "date-fns";
import ConfirmDialog from "../components/ConfirmDialog.jsx";
import EmptyState from "../components/EmptyState.jsx";
import FloatingActionButton from "../components/FloatingActionButton.jsx";
import { SkeletonTable } from "../components/SkeletonLoader.jsx";

const Transactions = () => {
  const {
    transactions,
    transactionsLoading,
    categories,
    fetchTransactions,
    fetchCategories,
    addTransaction,
    updateTransaction,
    deleteTransaction,
  } = useStore();

  const [showModal, setShowModal] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [currentTransaction, setCurrentTransaction] = useState(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [filters, setFilters] = useState({
    type: "",
    category: "",
    date_from: "",
    date_to: "",
    amount_min: "",
    amount_max: "",
  });

  const [formData, setFormData] = useState({
    description: "",
    amount: "",
    type: "EXPENSE",
    category: "",
    date: format(new Date(), "yyyy-MM-dd"),
  });

  useEffect(() => {
    fetchTransactions();
    fetchCategories();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    fetchTransactions(newFilters);
  };

  const resetFilters = () => {
    setFilters({
      type: "",
      category: "",
      date_from: "",
      date_to: "",
      amount_min: "",
      amount_max: "",
    });
    fetchTransactions({});
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const openAddModal = () => {
    setEditMode(false);
    setFormData({
      description: "",
      amount: "",
      type: "EXPENSE",
      category: "",
      date: format(new Date(), "yyyy-MM-dd"),
    });
    setShowModal(true);
  };

  const openEditModal = (transaction) => {
    setEditMode(true);
    setCurrentTransaction(transaction);
    setFormData({
      description: transaction.description,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      date: transaction.date,
    });
    setShowModal(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editMode) {
        await updateTransaction(currentTransaction.id, formData);
      } else {
        await addTransaction(formData);
      }
      setShowModal(false);
      fetchTransactions(filters);
    } catch (error) {
      console.error("Error saving transaction:", error);
    }
  };

  const handleDelete = async (id) => {
    setDeleteId(id);
    setShowConfirm(true);
  };

  const confirmDelete = async () => {
    if (deleteId) {
      try {
        await deleteTransaction(deleteId);
        fetchTransactions(filters);
      } catch (error) {
        console.error("Error deleting transaction:", error);
      }
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getCategoryName = (categoryId) => {
    const category = categories.find((c) => c.id === categoryId);
    return category ? category.name : "Unknown";
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Transactions</h1>
      </div>

      <FloatingActionButton onClick={openAddModal} label="Add Transaction" />

      {/* Filters */}
      <div className="bg-white rounded-md shadow-sm p-6 border border-gray-100">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <select
            name="type"
            value={filters.type}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Types</option>
            <option value="INCOME">Income</option>
            <option value="EXPENSE">Expense</option>
          </select>

          <select
            name="category"
            value={filters.category}
            onChange={handleFilterChange}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          >
            <option value="">All Categories</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>

          <input
            type="date"
            name="date_from"
            value={filters.date_from}
            onChange={handleFilterChange}
            placeholder="From Date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="date"
            name="date_to"
            value={filters.date_to}
            onChange={handleFilterChange}
            placeholder="To Date"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="number"
            name="amount_min"
            value={filters.amount_min}
            onChange={handleFilterChange}
            placeholder="Min Amount"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />

          <input
            type="number"
            name="amount_max"
            value={filters.amount_max}
            onChange={handleFilterChange}
            placeholder="Max Amount"
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          />
        </div>
        <button
          onClick={resetFilters}
          className="mt-4 px-4 py-2 text-sm text-blue-600 hover:text-blue-800 font-medium"
        >
          Reset Filters
        </button>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-md shadow-sm border border-gray-100 overflow-hidden">
        {transactionsLoading ? (
          <SkeletonTable />
        ) : transactions.length === 0 ? (
          <EmptyState
            icon="🔍"
            title="No Transactions Found"
            message="No transactions match your filters. Try adjusting your search criteria or add a new transaction."
            actionLabel="Add Transaction"
            onAction={openAddModal}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Date
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Description
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase">
                    Type
                  </th>
                  <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase">
                    Amount
                  </th>
                  <th className="px-6 py-4 text-center text-xs font-semibold text-gray-600 uppercase">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {transactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="hover:bg-gray-50 transition-smooth"
                  >
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </td>
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {transaction.description}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {getCategoryName(transaction.category)}
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          transaction.type === "INCOME"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {transaction.type}
                      </span>
                    </td>
                    <td
                      className={`px-6 py-4 text-sm font-bold text-right ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button
                        onClick={() => openEditModal(transaction)}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm mr-4"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(transaction.id)}
                        className="text-red-600 hover:text-red-800 font-medium text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 transform transition-all animate-scaleIn">
            <h2 className="text-2xl font-bold mb-6">
              {editMode ? "Edit Transaction" : "Add Transaction"}
            </h2>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Description
                </label>
                <input
                  type="text"
                  name="description"
                  value={formData.description}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Amount
                </label>
                <input
                  type="number"
                  name="amount"
                  value={formData.amount}
                  onChange={handleInputChange}
                  step="0.01"
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="INCOME">Income</option>
                  <option value="EXPENSE">Expense</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Category
                </label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                >
                  <option value="">Select Category</option>
                  {categories
                    .filter((cat) => cat.type === formData.type)
                    .map((cat) => (
                      <option key={cat.id} value={cat.id}>
                        {cat.name}
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date
                </label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="submit"
                  className="flex-1 bg-blue-600 text-white py-2.5 rounded-lg font-semibold hover:bg-blue-700 transition-smooth"
                >
                  {editMode ? "Update" : "Add"}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 rounded-lg font-semibold hover:bg-gray-200 transition-smooth"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Confirm Dialog */}
      <ConfirmDialog
        isOpen={showConfirm}
        onClose={() => setShowConfirm(false)}
        onConfirm={confirmDelete}
        title="Delete Transaction"
        message="Are you sure you want to delete this transaction? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
      />

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.95);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-fadeIn {
          animation: fadeIn 0.2s ease-out;
        }
        .animate-scaleIn {
          animation: scaleIn 0.3s ease-out;
        }
      `}</style>
    </div>
  );
};

export default Transactions;
