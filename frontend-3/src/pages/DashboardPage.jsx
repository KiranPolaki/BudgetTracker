import React, { Suspense, lazy } from "react";
import { useQuery } from "@tanstack/react-query";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import { formatCurrency } from "../lib/utils";
import TransactionItem from "../components/transactions/TransactionItem";
import { getDashboardData } from "../api/transactions";
import {
  ArrowUpCircle,
  ArrowDownCircle,
  Wallet,
  DollarSign,
} from "lucide-react";

const ExpensesDonutChart = lazy(() =>
  import("../components/charts/ExpensesDonutChart")
);

const SummaryCard = ({ title, value, icon: Icon, color }) => (
  <Card className="bg-zinc-900 text-zinc-100 border border-zinc-800 p-4 flex items-center gap-4 h-full rounded-lg shadow-sm">
    <div className="w-12 h-12 flex items-center justify-center rounded-lg bg-zinc-800">
      <Icon className={`w-6 h-6 ${color}`} />
    </div>
    <div>
      <p className="text-sm text-zinc-400">{title}</p>
      <p className={`mt-1 text-2xl font-semibold ${color}`}>
        {formatCurrency(value)}
      </p>
    </div>
  </Card>
);

const DashboardPage = () => {
  const {
    data: dashboardData,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["dashboardData"],
    queryFn: getDashboardData,
  });

  if (isLoading)
    return (
      <div className="flex justify-center mt-10">
        <Spinner />
      </div>
    );
  if (isError)
    return (
      <p className="text-center text-red-500 mt-10">
        Failed to load dashboard data.
      </p>
    );

  const monthly_income = dashboardData?.monthly_income || 0;
  const monthly_expenses = dashboardData?.monthly_expenses || 0;
  const balance = dashboardData?.balance || 0;
  const budget_remaining = dashboardData?.budget_remaining || 0;
  const recent_transactions = dashboardData?.recent_transactions || [];
  const chartData =
    dashboardData?.expenses_by_category?.map((item) => ({
      label: item.category__name,
      value: parseFloat(item.total),
    })) || [];

  return (
    <div className="space-y-6 mt-12">
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          title="Monthly Income"
          value={monthly_income}
          icon={ArrowUpCircle}
          color="text-emerald-400"
        />
        <SummaryCard
          title="Monthly Expenses"
          value={monthly_expenses}
          icon={ArrowDownCircle}
          color="text-rose-400"
        />
        <SummaryCard
          title="Balance"
          value={balance}
          icon={Wallet}
          color="text-indigo-400"
        />
        <SummaryCard
          title="Budget Remaining"
          value={budget_remaining}
          icon={DollarSign}
          color={budget_remaining >= 0 ? "text-blue-400" : "text-rose-400"}
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <Card className="lg:col-span-2 bg-zinc-900 text-zinc-100 border border-zinc-800 p-6 rounded-xl shadow-md">
          <p className="text-xl font-bold text-zinc-100 mb-5">
            Recent Transactions
          </p>
          <div className="overflow-y-auto max-h-80">
            {recent_transactions.length ? (
              <ul className="divide-y divide-zinc-700">
                {recent_transactions.map((tx) => (
                  <TransactionItem key={tx.id} transaction={tx} />
                ))}
              </ul>
            ) : (
              <p className="text-zinc-500 py-6 text-center">
                No recent transactions.
              </p>
            )}
          </div>
        </Card>

        <Card className="bg-zinc-900 text-zinc-100 border border-zinc-800 p-6 rounded-xl shadow-md w-full h-full flex flex-col">
          <p className="text-lg font-semibold text-zinc-100 mb-4">
            Expenses by Category
          </p>
          <div className="flex-1 w-full flex items-center justify-center">
            <Suspense
              fallback={
                <div className="flex h-64 items-center justify-center">
                  <Spinner />
                </div>
              }
            >
              {chartData.length ? (
                <ExpensesDonutChart data={chartData} />
              ) : (
                <p className="text-zinc-400 py-6 text-center">
                  No expense data for this month.
                </p>
              )}
            </Suspense>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
