import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import PieChart from "../components/charts/PieChart.jsx";
import BarChart from "../components/charts/BarChart.jsx";
import EmptyState from "../components/EmptyState.jsx";
import AnimatedNumber from "../components/AnimatedNumber.jsx";
import {
  SkeletonCard,
  SkeletonChart,
  SkeletonList,
} from "../components/SkeletonLoader.jsx";
import { format } from "date-fns";
import useStore from "../store/useStore.js";

const Dashboard = () => {
  const navigate = useNavigate();
  const { dashboard, dashboardLoading, fetchDashboard } = useStore();

  useEffect(() => {
    fetchDashboard();
  }, []);

  if (dashboardLoading) {
    return (
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <div className="h-9 bg-gray-200 rounded w-48 animate-pulse"></div>
          <div className="h-6 bg-gray-200 rounded w-32 animate-pulse"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <SkeletonCard key={i} />
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <SkeletonChart />
          <SkeletonChart />
        </div>

        <SkeletonChart />
        <SkeletonList rows={5} />
      </div>
    );
  }

  if (!dashboard) return null;

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const StatCard = ({ title, amount, color, icon }) => (
    <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 hover:shadow-lg transition-all duration-300 hover:-translate-y-1 cursor-pointer group">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600 mb-1">{title}</p>
          <p className={`text-2xl font-bold ${color}`}>
            <AnimatedNumber value={amount} formatFn={formatCurrency} />
          </p>
        </div>
        <div
          className={`w-12 h-12 rounded-full ${color
            .replace("text", "bg")
            .replace(
              "600",
              "100"
            )} flex items-center justify-center group-hover:scale-110 transition-transform duration-300`}
        >
          <span className="text-2xl">{icon}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">{format(new Date(), "MMMM dd, yyyy")}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Income"
          amount={dashboard.total_income}
          color="text-green-600"
          icon="💰"
        />
        <StatCard
          title="Total Expenses"
          amount={dashboard.total_expenses}
          color="text-red-600"
          icon="💸"
        />
        <StatCard
          title="Balance"
          amount={dashboard.balance}
          color={dashboard.balance >= 0 ? "text-blue-600" : "text-red-600"}
          icon="💳"
        />
        <StatCard
          title="Monthly Budget"
          amount={dashboard.current_month_budget}
          color="text-purple-600"
          icon="📊"
        />
      </div>

      {/* Monthly Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            This Month Income
          </h3>
          <p className="text-2xl font-bold text-green-600">
            {formatCurrency(dashboard.monthly_income)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            This Month Expenses
          </h3>
          <p className="text-2xl font-bold text-red-600">
            {formatCurrency(dashboard.monthly_expenses)}
          </p>
        </div>
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <h3 className="text-sm font-semibold text-gray-600 mb-2">
            Budget Remaining
          </h3>
          <p
            className={`text-2xl font-bold ${
              dashboard.budget_remaining >= 0
                ? "text-green-600"
                : "text-red-600"
            }`}
          >
            {formatCurrency(dashboard.budget_remaining)}
          </p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {dashboard.income_by_category?.length > 0 ? (
            <PieChart
              data={dashboard.income_by_category}
              title="Income by Category"
            />
          ) : (
            <EmptyState
              icon="💰"
              title="No Income Data"
              message="Start tracking your income to see the breakdown here."
              actionLabel="Add Income"
              onAction={() => navigate("/transactions")}
            />
          )}
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {dashboard.expenses_by_category?.length > 0 ? (
            <PieChart
              data={dashboard.expenses_by_category}
              title="Expenses by Category"
            />
          ) : (
            <EmptyState
              icon="💸"
              title="No Expense Data"
              message="Start tracking your expenses to see the breakdown here."
              actionLabel="Add Expense"
              onAction={() => navigate("/transactions")}
            />
          )}
        </div>
      </div>

      {/* Bar Chart */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
        {dashboard.expenses_by_category?.length > 0 ? (
          <BarChart
            data={dashboard.expenses_by_category}
            title="Expense Breakdown"
            color="#ef4444"
          />
        ) : (
          <EmptyState
            icon="📊"
            title="No Data to Display"
            message="Add some transactions to see your expense breakdown chart."
          />
        )}
      </div>

      {/* Recent Transactions */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100">
        <div className="p-6 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            Recent Transactions
          </h2>
          <button
            onClick={() => navigate("/transactions")}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition"
          >
            View All →
          </button>
        </div>
        <div className="divide-y divide-gray-100">
          {dashboard.recent_transactions?.length > 0 ? (
            dashboard.recent_transactions.map((transaction) => (
              <div
                key={transaction.id}
                className="p-6 hover:bg-gray-50 transition cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div
                      className={`w-12 h-12 rounded-full flex items-center justify-center ${
                        transaction.type === "INCOME"
                          ? "bg-green-100"
                          : "bg-red-100"
                      }`}
                    >
                      <span className="text-xl">
                        {transaction.type === "INCOME" ? "💰" : "💸"}
                      </span>
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">
                        {transaction.description}
                      </p>
                      <p className="text-sm text-gray-500">
                        {transaction.category_name}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`font-bold text-lg ${
                        transaction.type === "INCOME"
                          ? "text-green-600"
                          : "text-red-600"
                      }`}
                    >
                      {transaction.type === "INCOME" ? "+" : "-"}
                      {formatCurrency(transaction.amount)}
                    </p>
                    <p className="text-sm text-gray-500">
                      {format(new Date(transaction.date), "MMM dd, yyyy")}
                    </p>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <EmptyState
              icon="📝"
              title="No Transactions Yet"
              message="Start adding transactions to track your finances effectively."
              actionLabel="Add Transaction"
              onAction={() => navigate("/transactions")}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
