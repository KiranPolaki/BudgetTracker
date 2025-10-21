import { useEffect, useState, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchBudgets, createBudget, updateBudget } from "../store/budgetSlice";
import { fetchCategories } from "../store/categorySlice";
import { fetchTransactions } from "../store/transactionSlice";
import type { Category, Budget, Transaction } from "../types";
import DonutChart from "../components/charts/DonutChart";
import BarChart from "../components/charts/BarChart";
import Modal from "../components/Modal";

export default function Budget() {
  const dispatch = useDispatch<AppDispatch>();
  const budgets = useSelector((state: RootState) => state.budgets.items);
  const categories = useSelector((state: RootState) => state.categories.items);
  const transactions = useSelector(
    (state: RootState) => state.transactions.items
  );

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(
    null
  );
  const [budgetAmount, setBudgetAmount] = useState("");
  const [currentMonth] = useState(new Date().toISOString().substring(0, 7));

  useEffect(() => {
    dispatch(fetchBudgets());
    dispatch(fetchCategories());
    dispatch(fetchTransactions({ page: 1, filters: { month: currentMonth } }));
  }, [dispatch, currentMonth]);

  const expenseCategories = useMemo(
    () =>
      Array.isArray(categories)
        ? categories.filter((cat) => cat.type === "EXPENSE")
        : [],
    [categories]
  );

  const budgetData = useMemo(() => {
    if (!Array.isArray(budgets) || !Array.isArray(transactions)) {
      return [];
    }

    const data = expenseCategories.map((category) => {
      const budget =
        budgets.find(
          (b) => b.category.id === category.id && b.month === currentMonth
        )?.amount || 0;

      const actual = transactions
        .filter(
          (t) =>
            t.category.id === category.id &&
            t.type === "EXPENSE" &&
            t.date.startsWith(currentMonth)
        )
        .reduce((sum, t) => sum + t.amount, 0);

      return {
        category: category.name,
        budget,
        actual,
      };
    });

    return data;
  }, [budgets, expenseCategories, transactions, currentMonth]);

  const totalBudget = useMemo(
    () =>
      Array.isArray(budgets)
        ? budgets
            .filter((b: Budget) => b.month === currentMonth)
            .reduce((sum: number, b: Budget) => sum + b.amount, 0)
        : 0,
    [budgets, currentMonth]
  );

  const totalExpenses = useMemo(
    () =>
      Array.isArray(transactions)
        ? transactions
            .filter(
              (t: Transaction) =>
                t.type === "EXPENSE" && t.date.startsWith(currentMonth)
            )
            .reduce((sum: number, t: Transaction) => sum + t.amount, 0)
        : 0,
    [transactions, currentMonth]
  );

  const handleSaveBudget = async () => {
    if (!selectedCategory || !budgetAmount) return;

    const amount = parseFloat(budgetAmount);
    const existingBudget = budgets.find(
      (b) => b.category.id === selectedCategory.id && b.month === currentMonth
    );

    if (existingBudget) {
      await dispatch(
        updateBudget({
          id: existingBudget.id,
          data: { amount },
        })
      );
    } else {
      await dispatch(
        createBudget({
          category: selectedCategory.id,
          amount,
          month: currentMonth,
        })
      );
    }

    setIsModalOpen(false);
    setSelectedCategory(null);
    setBudgetAmount("");
    dispatch(fetchBudgets());
  };

  const handleEditBudget = (categoryId: number) => {
    const category = categories.find((c) => c.id === categoryId);
    if (!category) return;

    const budget = budgets.find(
      (b) => b.category.id === categoryId && b.month === currentMonth
    );

    setSelectedCategory(category);
    setBudgetAmount(budget?.amount.toString() || "");
    setIsModalOpen(true);
  };

  if (!Array.isArray(categories) || categories.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <div className="text-lg">
          <span className="font-medium">Month: </span>
          {new Date(currentMonth).toLocaleDateString(undefined, {
            year: "numeric",
            month: "long",
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Total Budget
          </h3>
          <div className="text-3xl font-bold text-blue-600">
            ${totalBudget.toLocaleString()}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">
            Total Expenses
          </h3>
          <div
            className={`text-3xl font-bold ${
              totalExpenses > totalBudget ? "text-red-600" : "text-green-600"
            }`}
          >
            ${totalExpenses.toLocaleString()}
            {totalBudget > 0 && (
              <span className="text-base font-normal text-gray-500 ml-2">
                ({Math.round((totalExpenses / totalBudget) * 100)}% of budget)
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Budget Distribution</h2>
          <div className="h-80">
            <DonutChart
              data={budgetData.map((d) => ({
                category: d.category,
                amount: d.budget,
              }))}
            />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-6">Budget vs Actual</h2>
          <div className="h-80">
            <BarChart data={budgetData} />
          </div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Budget Settings</h2>
        </div>
        <div className="p-6">
          <table className="min-w-full divide-y divide-gray-200">
            <thead>
              <tr>
                <th className="px-6 py-3 bg-gray-50 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Category
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Budget
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actual
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Remaining
                </th>
                <th className="px-6 py-3 bg-gray-50 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetData.map(({ category, budget, actual }) => (
                <tr key={category}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {category}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${budget.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-right text-gray-900">
                    ${actual.toLocaleString()}
                  </td>
                  <td
                    className={`px-6 py-4 whitespace-nowrap text-sm text-right font-medium ${
                      budget - actual >= 0 ? "text-green-600" : "text-red-600"
                    }`}
                  >
                    ${(budget - actual).toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() =>
                        handleEditBudget(
                          expenseCategories.find((c) => c.name === category)
                            ?.id || 0
                        )
                      }
                      className="text-blue-600 hover:text-blue-900"
                    >
                      Edit Budget
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedCategory(null);
          setBudgetAmount("");
        }}
        title="Set Budget"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Category
            </label>
            <select
              value={selectedCategory?.id || ""}
              onChange={(e) => {
                const category = categories.find(
                  (c) => c.id === parseInt(e.target.value)
                );
                setSelectedCategory(category || null);
              }}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {expenseCategories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Budget Amount
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              className="w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
              placeholder="0.00"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-4">
            <button
              onClick={() => {
                setIsModalOpen(false);
                setSelectedCategory(null);
                setBudgetAmount("");
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveBudget}
              disabled={!selectedCategory || !budgetAmount}
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              Save Budget
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
