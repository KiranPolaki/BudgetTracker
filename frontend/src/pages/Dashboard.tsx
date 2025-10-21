import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState } from "../store";
import { fetchTransactions } from "../store/transactionSlice";
import { fetchCategories } from "../store/categorySlice";
import { fetchBudgets } from "../store/budgetSlice";
import DonutChart from "../components/charts/DonutChart";
import LineChart from "../components/charts/LineChart";
import BarChart from "../components/charts/BarChart";
import { Link } from "react-router-dom";

export default function Dashboard() {
  const dispatch = useDispatch();
  const transactions = useSelector(
    (state: RootState) => state.transactions.items
  );
  const categories = useSelector((state: RootState) => state.categories.items);
  const budgets = useSelector((state: RootState) => state.budgets.items);

  useEffect(() => {
    dispatch(fetchTransactions({ page: 1 }));
    dispatch(fetchCategories());
    dispatch(fetchBudgets());
  }, [dispatch]);

  // Calculate financial summary
  const summary = useMemo(() => {
    const income = transactions
      .filter((t) => t.type === "INCOME")
      .reduce((sum, t) => sum + t.amount, 0);

    const expenses = transactions
      .filter((t) => t.type === "EXPENSE")
      .reduce((sum, t) => sum + t.amount, 0);

    return {
      totalIncome: income,
      totalExpenses: expenses,
      balance: income - expenses,
    };
  }, [transactions]);

  // Prepare data for expense by category chart
  const expensesByCategory = useMemo(() => {
    const expenseMap = new Map();
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const current = expenseMap.get(t.category.name) || 0;
        expenseMap.set(t.category.name, current + t.amount);
      });

    return Array.from(expenseMap.entries()).map(([category, amount]) => ({
      category,
      amount: amount as number,
    }));
  }, [transactions]);

  // Prepare data for expense trend chart
  const expenseTrend = useMemo(() => {
    const monthlyExpenses = new Map();
    transactions
      .filter((t) => t.type === "EXPENSE")
      .forEach((t) => {
        const month = t.date.substring(0, 7); // YYYY-MM
        const current = monthlyExpenses.get(month) || 0;
        monthlyExpenses.set(month, current + t.amount);
      });

    return Array.from(monthlyExpenses.entries())
      .map(([date, value]) => ({ date, value: value as number }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [transactions]);

  // Prepare data for budget comparison chart
  const budgetComparison = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().substring(0, 7);

    return categories
      .filter((cat) => cat.type === "EXPENSE")
      .map((category) => {
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
  }, [categories, budgets, transactions]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      {/* Financial Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Income</h3>
          <p className="mt-2 text-3xl font-bold text-green-600">
            ${summary.totalIncome.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Total Expenses</h3>
          <p className="mt-2 text-3xl font-bold text-red-600">
            ${summary.totalExpenses.toLocaleString()}
          </p>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-sm font-medium text-gray-500">Balance</h3>
          <p
            className={`mt-2 text-3xl font-bold ${
              summary.balance >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            ${summary.balance.toLocaleString()}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Expenses by Category</h2>
          <div className="h-80">
            <DonutChart data={expensesByCategory} />
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Expense Trend</h2>
          <div className="h-80">
            <LineChart data={expenseTrend} />
          </div>
        </div>
      </div>

      {/* Budget Overview */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Budget vs Actual</h2>
          <Link
            to="/budget"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            Manage Budget →
          </Link>
        </div>
        <div className="h-96">
          <BarChart data={budgetComparison} />
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="flex justify-between items-center p-6">
          <h2 className="text-xl font-semibold">Recent Transactions</h2>
          <Link
            to="/transactions"
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            View All →
          </Link>
        </div>
        <div className="border-t border-gray-200">
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
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {transactions.slice(0, 5).map((transaction) => (
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
