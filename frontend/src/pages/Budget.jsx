import { useEffect, useState } from "react";
import useStore from "../store/useStore";
import AnimatedNumber from "../components/AnimatedNumber.jsx";
import { format } from "date-fns";

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

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency: "INR",
      minimumFractionDigits: 0,
    }).format(amount || 0);
  };

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
    if (!dashboard?.current_month_budget) return "text-gray-600";
    if (budgetPercentage >= 100) return "text-red-600";
    if (budgetPercentage >= 80) return "text-orange-600";
    return "text-green-600";
  };

  //   const getProgressColor = () => {
  //     if (budgetPercentage >= 100)
  //       return "bg-gradient-to-r from-red-500 to-red-600";
  //     if (budgetPercentage >= 80)
  //       return "bg-gradient-to-r from-orange-500 to-orange-600";
  //     return "bg-gradient-to-r from-green-500 to-green-600";
  //   };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Budget Management</h1>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-600">Current Month:</span>
          <span className="font-semibold text-gray-900">
            {format(new Date(), "MMMM yyyy")}
          </span>
        </div>
      </div>

      {/* Set Budget Form */}
      <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl shadow-sm p-6 border border-blue-100">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center">
            <span className="text-xl">💰</span>
          </div>
          <h2 className="text-xl font-semibold text-gray-900">
            Set Monthly Budget
          </h2>
        </div>
        <form onSubmit={handleSetBudget} className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Budget Amount for {format(new Date(), "MMMM yyyy")}
            </label>
            <input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              step="0.01"
              required
              className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none bg-white shadow-sm"
              placeholder="Enter budget amount"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-8 py-3 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-lg font-semibold hover:from-blue-700 hover:to-indigo-700 disabled:from-gray-400 disabled:to-gray-400 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                    fill="none"
                  />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Saving...
              </span>
            ) : (
              "Set Budget"
            )}
          </button>
        </form>
      </div>

      {/* Budget Overview */}
      {dashboard && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Monthly Budget</p>
              <p className="text-3xl font-bold text-blue-600">
                {formatCurrency(dashboard.current_month_budget)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Spent This Month</p>
              <p className="text-3xl font-bold text-red-600">
                {formatCurrency(dashboard.monthly_expenses)}
              </p>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <p className="text-sm text-gray-600 mb-2">Remaining</p>
              <p
                className={`text-3xl font-bold ${
                  dashboard.budget_remaining >= 0
                    ? "text-green-600"
                    : "text-red-600"
                }`}
              >
                {formatCurrency(dashboard.budget_remaining)}
              </p>
            </div>
          </div>

          {/* Budget Progress */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Budget Progress</h3>
              <span className={`text-sm font-semibold ${getStatusColor()}`}>
                {getBudgetStatus()}
              </span>
            </div>

            <div className="mb-4">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>{budgetPercentage.toFixed(1)}% used</span>
                <span>
                  {formatCurrency(dashboard.monthly_expenses)} /{" "}
                  {formatCurrency(dashboard.current_month_budget)}
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${
                    budgetPercentage >= 100
                      ? "bg-red-600"
                      : budgetPercentage >= 80
                      ? "bg-orange-500"
                      : "bg-green-500"
                  }`}
                  style={{ width: `${Math.min(budgetPercentage, 100)}%` }}
                ></div>
              </div>
            </div>

            {budgetPercentage >= 80 && (
              <div
                className={`mt-4 p-4 rounded-lg ${
                  budgetPercentage >= 100
                    ? "bg-red-50 text-red-800"
                    : "bg-orange-50 text-orange-800"
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

          {/* Expense Breakdown */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center shadow-lg">
                <span className="text-2xl">📋</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-gray-900">
                  Expense Breakdown by Category
                </h3>
                <p className="text-sm text-gray-500">
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
                      className="group hover:bg-gray-50 p-3 rounded-lg transition-colors duration-200"
                    >
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className="font-semibold text-gray-700 flex items-center gap-2">
                          <span className="w-3 h-3 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600"></span>
                          {category.category__name}
                        </span>
                        <div className="text-right">
                          <span className="text-gray-900 font-bold">
                            <AnimatedNumber
                              value={category.total}
                              formatFn={formatCurrency}
                            />
                          </span>
                          <span className="text-gray-500 text-xs ml-2">
                            (
                            <AnimatedNumber
                              value={percentage}
                              formatFn={(n) => `${n.toFixed(1)}%`}
                            />
                            )
                          </span>
                        </div>
                      </div>
                      <div className="relative w-full bg-gray-200 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-blue-500 to-indigo-600 h-2.5 rounded-full transition-all duration-1000 ease-out"
                          style={{ width: `${Math.min(percentage, 100)}%` }}
                        >
                          <div className="absolute inset-0 bg-white opacity-20 animate-pulse"></div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <p className="text-center text-gray-500 py-8">
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
