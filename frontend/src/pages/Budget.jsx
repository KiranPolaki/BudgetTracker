import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import AnimatedNumber from "../components/AnimatedNumber.jsx";
import { format } from "date-fns";
import Button from "../components/Button";
import Input from "../components/Input";

const Budget = () => {
  const {
    dashboard,
    currentBudget,
    fetchDashboard,
    fetchCurrentBudget,
    setCurrentBudget,
  } = useStore();

  const [budgetAmount, setBudgetAmount] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchCurrentBudget();
  }, []);

  useEffect(() => {
    if (currentBudget) {
      setBudgetAmount(currentBudget.amount);
    }
  }, [currentBudget]);

  const handleSetBudget = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await setCurrentBudget(budgetAmount);
    } catch (error) {
      console.error("Error setting budget:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) =>
    new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);

  const budgetPercentage = dashboard?.current_month_budget
    ? Math.min(
        (dashboard.monthly_expenses / dashboard.current_month_budget) * 100,
        100
      )
    : 0;

  const getBudgetStatus = () => {
    if (!dashboard?.current_month_budget) return "No budget set";
    if (budgetPercentage >= 100) return "Budget exceeded!";
    if (budgetPercentage >= 80) return "Nearing budget limit";
    return "Within budget";
  };

  const getStatusColor = () => {
    if (!dashboard?.current_month_budget) return "text-gray-400";
    if (budgetPercentage >= 100) return "text-red-500";
    if (budgetPercentage >= 80) return "text-orange-400";
    return "text-green-400";
  };

  return (
    <div className="space-y-6 text-white">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budget Management</h1>
        <div className="flex items-center gap-2 text-gray-400">
          <span className="text-sm">Current Month:</span>
          <span className="font-semibold">
            {format(new Date(), "MMMM yyyy")}
          </span>
        </div>
      </div>

      <div className="bg-zinc-900 rounded-md shadow-sm p-6 border border-zinc-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xl">💰</span>
          </div>
          <h2 className="text-xl font-semibold">Set Monthly Budget</h2>
        </div>
        <form onSubmit={handleSetBudget} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-400 mb-2">
              Budget Amount for {format(new Date(), "MMMM yyyy")}
            </label>
            <Input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              step="0.01"
              required
              placeholder="Enter budget amount"
            />
          </div>
          <Button type="submit" variant="primary" disabled={loading}>
            {loading ? "Saving..." : "Set Budget"}
          </Button>
        </form>
      </div>

      {dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-zinc-800 rounded-md shadow-sm p-6 border border-zinc-700">
              <p className="text-sm text-gray-400 mb-2">Monthly Budget</p>
              <p className="text-3xl font-bold text-blue-500">
                {formatCurrency(dashboard.current_month_budget)}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-md shadow-sm p-6 border border-zinc-700">
              <p className="text-sm text-gray-400 mb-2">Spent This Month</p>
              <p className="text-3xl font-bold text-red-500">
                {formatCurrency(dashboard.monthly_expenses)}
              </p>
            </div>

            <div className="bg-zinc-800 rounded-md shadow-sm p-6 border border-zinc-700">
              <p className="text-sm text-gray-400 mb-2">Remaining</p>
              <p
                className={`text-3xl font-bold ${
                  dashboard.budget_remaining >= 0
                    ? "text-green-400"
                    : "text-red-500"
                }`}
              >
                {formatCurrency(dashboard.budget_remaining)}
              </p>
            </div>
          </div>

          <div className="bg-zinc-800 rounded-md shadow-sm p-6 border border-zinc-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Budget Progress</h3>
              <span className={`text-sm font-semibold ${getStatusColor()}`}>
                {getBudgetStatus()}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-400 mb-2">
                <span>{budgetPercentage.toFixed(1)}% used</span>
                <span>
                  {formatCurrency(dashboard.monthly_expenses)} /{" "}
                  {formatCurrency(dashboard.current_month_budget)}
                </span>
              </div>
              <div className="w-full bg-zinc-700 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    budgetPercentage >= 100
                      ? "bg-red-500"
                      : budgetPercentage >= 80
                      ? "bg-orange-400"
                      : "bg-green-400"
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {budgetPercentage >= 80 && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  budgetPercentage >= 100
                    ? "bg-red-900 text-red-300"
                    : "bg-orange-900 text-orange-300"
                }`}
              >
                <p className="text-sm font-medium">
                  {budgetPercentage >= 100
                    ? "⚠️ You have exceeded your monthly budget!"
                    : "⚠️ Warning: You are approaching your budget limit."}
                </p>
              </div>
            )}
          </div>

          <div className="bg-zinc-800 rounded-md shadow-sm p-6 border border-zinc-700">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold">
                  Expense Breakdown by Category
                </h3>
                <p className="text-sm text-gray-400">
                  See where your money goes
                </p>
              </div>
            </div>
            {dashboard.expenses_by_category?.length > 0 ? (
              <div className="space-y-4">
                {dashboard.expenses_by_category.map((category, index) => {
                  const percentage = dashboard.current_month_budget
                    ? (category.total / dashboard.current_month_budget) * 100
                    : 0;
                  return (
                    <div
                      key={index}
                      className="group hover:bg-zinc-700 p-3 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-semibold text-gray-300 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></span>
                          {category.category__name}
                        </span>
                        <div className="text-right">
                          <span className="text-gray-100 font-bold">
                            <AnimatedNumber
                              value={category.total}
                              formatFn={formatCurrency}
                            />
                          </span>
                          <span className="text-gray-400 text-xs ml-2">
                            (
                            <AnimatedNumber
                              value={percentage}
                              formatFn={(n) => `${n.toFixed(1)}%`}
                            />
                            )
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full bg-zinc-700 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-white opacity-10 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-400 py-8">
                No expense data available
              </p>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default Budget;
