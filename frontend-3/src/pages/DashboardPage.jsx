import React, { Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { formatCurrency } from "../lib/utils";
import TransactionItem from "../components/transactions/TransactionItem";
import { getDashboardData } from "../api/transactions";

const ExpensesDonutChart = lazy(() =>
  import("../components/charts/ExpensesDonutChart")
);

const SummaryCard = ({ title, value, color }) => (
  <Card>
    <h3 className="text-sm font-medium text-gray-500">{title}</h3>
    <p className={`mt-1 text-3xl font-semibold ${color}`}>
      {formatCurrency(value)}
    </p>
  </Card>
);

const DashboardPage = () => {
  // Use a single query to fetch all dashboard data at once
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: getDashboardData,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center mt-10">
        <Spinner />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="text-center text-red-500">
        Failed to load dashboard data.
      </div>
    );
  }

  // Destructure data directly from the dashboardData object
  const monthly_income = dashboardData?.monthly_income || 0;
  const monthly_expenses = dashboardData?.monthly_expenses || 0;
  const balance = dashboardData?.balance || 0;
  // The backend already calculates the remaining budget, which is more reliable!
  const budget_remaining = dashboardData?.budget_remaining || 0;
  const recent_transactions = dashboardData?.recent_transactions || [];

  // Prepare chart data from the API response
  const chartData =
    dashboardData?.expenses_by_category?.map((item) => ({
      label: item.category__name,
      value: parseFloat(item.total),
    })) || [];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Monthly Income"
          value={monthly_income}
          color="text-green-600"
        />
        <SummaryCard
          title="Monthly Expenses"
          value={monthly_expenses}
          color="text-red-600"
        />
        <SummaryCard title="Balance" value={balance} color="text-indigo-600" />
        <SummaryCard
          title="Budget Remaining"
          value={budget_remaining} // Use the backend-calculated value
          color={budget_remaining >= 0 ? "text-blue-600" : "text-red-600"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="text-lg font-medium text-gray-900">
            Recent Transactions
          </h3>
          <div className="mt-4 flow-root">
            {recent_transactions.length > 0 ? (
              <ul role="list" className="-my-5 divide-y divide-gray-200">
                {recent_transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </ul>
            ) : (
              <p className="text-gray-500">No recent transactions.</p>
            )}
          </div>
        </Card>

        <Card>
          <h3 className="text-lg font-medium text-gray-900">
            Expenses by Category
          </h3>
          <Suspense
            fallback={
              <div className="flex h-64 items-center justify-center">
                <Spinner />
              </div>
            }
          >
            {chartData.length > 0 ? (
              <ExpensesDonutChart data={chartData} />
            ) : (
              <div className="flex h-64 items-center justify-center">
                <p className="text-gray-500">No expense data for this month.</p>
              </div>
            )}
          </Suspense>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
