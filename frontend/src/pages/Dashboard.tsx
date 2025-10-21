import { useEffect, useMemo } from "react";
import { useDispatch, useSelector } from "react-redux";
import type { RootState, AppDispatch } from "../store";
import { fetchTransactions } from "../store/transactionSlice";
import { fetchCategories } from "../store/categorySlice";
import { fetchBudgets } from "../store/budgetSlice";
import DonutChart from "../components/charts/DonutChart";
import LineChart from "../components/charts/LineChart";
import BarChart from "../components/charts/BarChart";
import { Link } from "react-router-dom";
import type { Transaction, Category, Budget } from "../types";

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // Get the data and loading states from Redux store
  const transactions = useSelector(
    (state: RootState) => state.transactions.items
  );
  const categories = useSelector((state: RootState) => state.categories.items);
  const budgets = useSelector((state: RootState) => state.budgets.items);
  const error = useSelector((state: RootState) => state.transactions.error);
  const isLoading = useSelector(
    (state: RootState) =>
      state.transactions.loading ||
      state.categories.loading ||
      state.budgets.loading
  );

  // Create safe arrays that handle undefined/null cases
  const safeTransactions = useMemo(
    () => (Array.isArray(transactions) ? transactions : []),
    [transactions]
  );

  const safeCategories = useMemo(
    () => (Array.isArray(categories) ? categories : []),
    [categories]
  );

  const safeBudgets = useMemo(
    () => (Array.isArray(budgets) ? budgets : []),
    [budgets]
  );

  useEffect(() => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    const loadDashboardData = async () => {
      try {
        const results = await Promise.allSettled([
          dispatch(
            fetchTransactions({
              page: 1,
              filters: {
                start_date: startDate.toISOString().split("T")[0],
                limit: 100,
              },
            })
          ),
          dispatch(fetchCategories()),
          dispatch(fetchBudgets()),
        ]);

        // Check if any requests failed
        const failures = results.filter(
          (result) => result.status === "rejected"
        );
        if (failures.length > 0) {
          console.error(
            "Some dashboard data failed to load:",
            failures.map((f) => (f as PromiseRejectedResult).reason)
          );
        }
      } catch (err) {
        console.error("Error loading dashboard data:", err);
      }
    };

    loadDashboardData();
  }, [dispatch]);

  const summary = useMemo(() => {
    return {
      totalIncome: safeTransactions
        .filter((t: Transaction) => t.type === "INCOME")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      totalExpenses: safeTransactions
        .filter((t: Transaction) => t.type === "EXPENSE")
        .reduce((sum: number, t: Transaction) => sum + t.amount, 0),
      get balance() {
        return this.totalIncome - this.totalExpenses;
      },
    };
  }, [safeTransactions]);

  interface ExpenseCategory {
    category: string;
    amount: number;
  }

  const expensesByCategory = useMemo((): ExpenseCategory[] => {
    const expenseMap = safeTransactions
      .filter((t: Transaction) => t.type === "EXPENSE")
      .reduce((acc: Map<string, number>, t: Transaction) => {
        const current = acc.get(t.category.name) || 0;
        acc.set(t.category.name, current + t.amount);
        return acc;
      }, new Map<string, number>());

    type MapEntry = [string, number];
    return Array.from(expenseMap.entries())
      .map(
        (entry: MapEntry): ExpenseCategory => ({
          category: entry[0],
          amount: entry[1],
        })
      )
      .sort((a, b) => b.amount - a.amount);
  }, [safeTransactions]);

  const expenseTrend = useMemo(() => {
    const monthlyExpenses = new Map<string, number>();
    safeTransactions
      .filter((t: Transaction) => t.type === "EXPENSE")
      .forEach((t: Transaction) => {
        const month = t.date.substring(0, 7);
        const current = monthlyExpenses.get(month) || 0;
        monthlyExpenses.set(month, current + t.amount);
      });

    return Array.from(monthlyExpenses.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [safeTransactions]);

  const budgetComparison = useMemo(() => {
    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().substring(0, 7);

    return safeCategories
      .filter((cat: Category) => cat.type === "EXPENSE")
      .map((category: Category) => {
        const budget =
          safeBudgets.find(
            (b: Budget) =>
              b.category.id === category.id && b.month === currentMonth
          )?.amount || 0;

        const actual = safeTransactions
          .filter(
            (t: Transaction) =>
              t.category.id === category.id &&
              t.type === "EXPENSE" &&
              t.date.startsWith(currentMonth)
          )
          .reduce((sum: number, t: Transaction) => sum + t.amount, 0);

        return {
          category: category.name,
          budget,
          actual,
        };
      });
  }, [safeCategories, safeBudgets, safeTransactions]);

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-8"></div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white rounded-lg shadow p-6">
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="mt-2 h-8 bg-gray-200 rounded w-3/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <h3 className="text-red-800 font-medium">Error loading dashboard</h3>
          <p className="text-red-600 mt-1">{error}</p>
        </div>
      </div>
    );
  }

  // Show empty state when there's no data
  if (!isLoading && safeTransactions.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-8">Dashboard</h1>
        <div className="text-center py-12">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 7h6m0 10v-3m-3 3h.01M9 17h.01M9 14h.01M12 14h.01M15 11h.01M12 11h.01M9 11h.01M7 21h10a2 2 0 002-2V5a2 2 0 00-2-2H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            No transactions
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Start by adding some transactions to see your financial overview.
          </p>
          <div className="mt-6">
            <Link
              to="/transactions"
              className="inline-flex items-center px-4 py-2 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              Add Transaction
            </Link>
          </div>
        </div>
      </div>
    );
  }

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
          <div className="h-80 border border-gray-200 relative">
            {expensesByCategory.length > 0 ? (
              <>
                <div className="absolute top-0 left-0 text-xs text-gray-500 bg-white p-1">
                  Data count: {expensesByCategory.length}
                </div>
                <DonutChart data={expensesByCategory} />
              </>
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500">No expense data available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add some expenses to see the breakdown
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Monthly Expense Trend</h2>
          <div className="h-80">
            {expenseTrend.length > 0 ? (
              <LineChart data={expenseTrend} />
            ) : (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <p className="text-gray-500">No trend data available</p>
                  <p className="text-sm text-gray-400 mt-1">
                    Add transactions to see your monthly trends
                  </p>
                </div>
              </div>
            )}
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
          {budgetComparison.length > 0 ? (
            <BarChart data={budgetComparison} />
          ) : (
            <div className="h-full flex items-center justify-center">
              <div className="text-center">
                <p className="text-gray-500">No budget data available</p>
                <p className="text-sm text-gray-400 mt-1">
                  Set up your budget to track spending
                </p>
                <Link
                  to="/budget"
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
                >
                  Set Up Budget
                </Link>
              </div>
            </div>
          )}
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
          {safeTransactions.length > 0 ? (
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
                {safeTransactions
                  .slice(0, 5)
                  .map((transaction: Transaction) => (
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
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-500">No recent transactions</p>
              <p className="text-sm text-gray-400 mt-1">
                Start adding transactions to see them here
              </p>
              <Link
                to="/transactions"
                className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
              >
                Add Transaction
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
