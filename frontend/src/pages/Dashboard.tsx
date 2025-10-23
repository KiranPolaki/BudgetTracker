import React, { useEffect, useMemo, useCallback } from "react";
import { useDispatch, useSelector } from "react-redux";
import { createSelector } from "@reduxjs/toolkit";
import type { RootState, AppDispatch } from "../store";
import { fetchTransactions } from "../store/transactionSlice";
import { fetchCategories } from "../store/categorySlice";
import { fetchBudgets } from "../store/budgetSlice";
import DonutChart from "../components/charts/DonutChart";
import LineChart from "../components/charts/LineChart";
import BarChart from "../components/charts/BarChart";
import { Link } from "react-router-dom";
import type { Transaction, Category, Budget } from "../types";

const selectDashboardData = createSelector(
  [
    (state: RootState) => state.transactions.items,
    (state: RootState) => state.categories.items,
    (state: RootState) => state.budgets.items,
  ],
  (transactions, categories, budgets) => ({
    transactions: Array.isArray(transactions) ? transactions : [],
    categories: Array.isArray(categories) ? categories : [],
    budgets: Array.isArray(budgets) ? budgets : [],
  })
);

const selectLoadingState = createSelector(
  [
    (state: RootState) => state.transactions.loading,
    (state: RootState) => state.categories.loading,
    (state: RootState) => state.budgets.loading,
  ],
  (transLoading, catLoading, budgetLoading) =>
    transLoading || catLoading || budgetLoading
);

export default function Dashboard() {
  const dispatch = useDispatch<AppDispatch>();

  // Use memoized selectors
  const { transactions, categories, budgets } =
    useSelector(selectDashboardData);
  const isLoading = useSelector(selectLoadingState);
  const error = useSelector((state: RootState) => state.transactions.error);

  // ✨ OPTIMIZATION 2: Memoize fetch function
  const loadDashboardData = useCallback(async () => {
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - 6);

    try {
      await Promise.all([
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
    } catch (err) {
      console.error("Error loading dashboard data:", err);
    }
  }, [dispatch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const dashboardMetrics = useMemo(() => {
    if (transactions.length === 0) {
      return null;
    }

    const currentDate = new Date();
    const currentMonth = currentDate.toISOString().substring(0, 7);

    let totalIncome = 0;
    let totalExpenses = 0;
    const expenseMap = new Map<string, number>();
    const monthlyExpenses = new Map<string, number>();
    const categoryMonthlyExpenses = new Map<string, number>();

    transactions.forEach((t: Transaction) => {
      if (t.type === "INCOME") {
        totalIncome += t.amount;
      } else if (t.type === "EXPENSE") {
        totalExpenses += t.amount;

        const current = expenseMap.get(t.category.name) || 0;
        expenseMap.set(t.category.name, current + t.amount);

        const month = t.date.substring(0, 7);
        const monthCurrent = monthlyExpenses.get(month) || 0;
        monthlyExpenses.set(month, monthCurrent + t.amount);

        if (t.date.startsWith(currentMonth)) {
          const catKey = t.category.id;
          const catCurrent = categoryMonthlyExpenses.get(catKey) || 0;
          categoryMonthlyExpenses.set(catKey, catCurrent + t.amount);
        }
      }
    });

    const expensesByCategory = Array.from(expenseMap.entries())
      .map(([category, amount]) => ({ category, amount }))
      .sort((a, b) => b.amount - a.amount);

    const expenseTrend = Array.from(monthlyExpenses.entries())
      .map(([date, value]) => ({ date, value }))
      .sort((a, b) => a.date.localeCompare(b.date));

    const budgetComparison = categories
      .filter((cat: Category) => cat.type === "EXPENSE")
      .map((category: Category) => {
        const budget =
          budgets.find(
            (b: Budget) =>
              b.category.id === category.id && b.month === currentMonth
          )?.amount || 0;

        const actual = categoryMonthlyExpenses.get(category.id) || 0;

        return {
          category: category.name,
          budget,
          actual,
        };
      });

    return {
      summary: {
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
      },
      expensesByCategory,
      expenseTrend,
      budgetComparison,
      recentTransactions: transactions.slice(0, 5),
    };
  }, [transactions, categories, budgets]);

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

  if (!dashboardMetrics) {
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

  const {
    summary,
    expensesByCategory,
    expenseTrend,
    budgetComparison,
    recentTransactions,
  } = dashboardMetrics;

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <SummaryCard
          title="Total Income"
          amount={summary.totalIncome}
          color="green"
        />
        <SummaryCard
          title="Total Expenses"
          amount={summary.totalExpenses}
          color="red"
        />
        <SummaryCard
          title="Balance"
          amount={summary.balance}
          color={summary.balance >= 0 ? "green" : "red"}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <ChartCard
          title="Expenses by Category"
          data={expensesByCategory}
          ChartComponent={DonutChart}
          emptyMessage="No expense data available"
        />
        <ChartCard
          title="Monthly Expense Trend"
          data={expenseTrend}
          ChartComponent={LineChart}
          emptyMessage="No trend data available"
        />
      </div>

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
            <EmptyState
              message="No budget data available"
              subMessage="Set up your budget to track spending"
              linkTo="/budget"
              linkText="Set Up Budget"
            />
          )}
        </div>
      </div>

      <TransactionsTable transactions={recentTransactions} />
    </div>
  );
}

const SummaryCard = React.memo(
  ({
    title,
    amount,
    color,
  }: {
    title: string;
    amount: number;
    color: string;
  }) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h3 className="text-sm font-medium text-gray-500">{title}</h3>
      <p className={`mt-2 text-3xl font-bold text-${color}-600`}>
        ${amount.toLocaleString()}
      </p>
    </div>
  )
);

const ChartCard = React.memo(
  ({ title, data, ChartComponent, emptyMessage }: any) => (
    <div className="bg-white rounded-lg shadow p-6">
      <h2 className="text-xl font-semibold mb-4">{title}</h2>
      <div className="h-80">
        {data.length > 0 ? (
          <ChartComponent data={data} />
        ) : (
          <div className="h-full flex items-center justify-center">
            <p className="text-gray-500">{emptyMessage}</p>
          </div>
        )}
      </div>
    </div>
  )
);

const EmptyState = React.memo(
  ({ message, subMessage, linkTo, linkText }: any) => (
    <div className="h-full flex items-center justify-center">
      <div className="text-center">
        <p className="text-gray-500">{message}</p>
        <p className="text-sm text-gray-400 mt-1">{subMessage}</p>
        <Link
          to={linkTo}
          className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-blue-600 bg-blue-100 hover:bg-blue-200"
        >
          {linkText}
        </Link>
      </div>
    </div>
  )
);

const TransactionsTable = React.memo(
  ({ transactions }: { transactions: Transaction[] }) => (
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
        {transactions.length > 0 ? (
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
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <EmptyState
            message="No recent transactions"
            subMessage="Start adding transactions to see them here"
            linkTo="/transactions"
            linkText="Add Transaction"
          />
        )}
      </div>
    </div>
  )
);
