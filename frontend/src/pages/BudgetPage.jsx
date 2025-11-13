import React, { useState, Suspense, lazy } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import { getCurrentBudget, setCurrentBudget } from "../api/budget";
import { fetchDashboardData } from "../api/dashboard";
import Card from "../components/ui/Card";
import Spinner from "../components/ui/Spinner";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { formatCurrency } from "../lib/utils";
import { Landmark, DollarSign, Pocket } from "lucide-react";

const BudgetGaugeChart = lazy(() =>
  import("../components/charts/BudgetGaugeChart")
);

const BudgetPage = () => {
  const queryClient = useQueryClient();
  const [budgetAmount, setBudgetAmount] = useState("");

  const { data: budget, isLoading: budgetLoading } = useQuery({
    queryKey: ["currentBudget"],
    queryFn: getCurrentBudget,
    retry: (failureCount, error) => error.response?.status !== 404,
    onSuccess: (data) => setBudgetAmount(data?.amount || ""),
  });

  const { data: dashboard, isLoading: dashboardLoading } = useQuery({
    queryKey: ["dashboard"],
    queryFn: fetchDashboardData,
  });

  const mutation = useMutation({
    mutationFn: (amount) => setCurrentBudget({ amount }),
    onSuccess: () => {
      toast.success("Budget updated!");
      queryClient.invalidateQueries(["currentBudget"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
    onError: () => toast.error("Failed to update budget."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate(parseFloat(budgetAmount));
  };

  const isLoading = budgetLoading || dashboardLoading;

  const chartData = {
    budget: parseFloat(budget?.amount || 0),
    spent: parseFloat(dashboard?.monthly_expenses || 0),
  };

  return (
    <div className="min-h-screen bg-black text-white p-6 space-y-6">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300">
          <div className="mb-6">
            <h2 className="text-2xl font-semibold text-gray-100">
              Set Your Budget
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Enter your monthly budget to track expenses and savings.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="Enter monthly budget"
              step="0.01"
              required
            />
            <Button
              type="submit"
              variant="primary"
              loading={mutation.isLoading}
              fullWidth
              className="py-2 transition-transform hover:scale-105"
            >
              Set Budget
            </Button>
          </form>

          <div className="mt-6 border-t border-zinc-700 pt-4 space-y-3">
            <div className="flex items-center justify-between text-gray-300">
              <div className="flex items-center gap-2">
                <Landmark className="w-5 h-5 text-gray-400" />
                <span>Budget</span>
              </div>
              <span className="font-medium text-gray-100">
                {formatCurrency(budget?.amount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-300">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-red-400" />
                <span>Spent</span>
              </div>
              <span className="font-medium text-red-400">
                {formatCurrency(dashboard?.monthly_expenses)}
              </span>
            </div>

            <div className="flex items-center justify-between text-gray-300">
              <div className="flex items-center gap-2">
                <Pocket className="w-5 h-5 text-green-400" />
                <span>Remaining</span>
              </div>
              <span
                className={`font-medium ${
                  dashboard?.budget_remaining < 0
                    ? "text-red-500"
                    : "text-green-400"
                }`}
              >
                {formatCurrency(dashboard?.budget_remaining)}
              </span>
            </div>
          </div>
        </Card>

        <Card className="bg-zinc-900 border border-zinc-700 p-6 rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 flex flex-col">
          <div className="mb-4">
            <h2 className="text-2xl font-semibold text-gray-100">
              Budget Overview
            </h2>
            <p className="text-sm text-gray-400 mt-1">
              Visual representation of your monthly budget vs expenses
            </p>
          </div>

          <div className="flex-1 flex items-center justify-center">
            {isLoading ? (
              <Spinner className="w-16 h-16" />
            ) : (
              <Suspense
                fallback={
                  <div className="flex items-center justify-center w-full h-full">
                    <Spinner className="w-16 h-16" />
                  </div>
                }
              >
                <BudgetGaugeChart data={chartData} />
              </Suspense>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default BudgetPage;
