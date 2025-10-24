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
    onSuccess: (data) => setBudgetAmount(data.amount || ""),
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
    <div className="space-y-6">
      <h1 className="text-2xl font-semibold text-gray-900">Monthly Budget</h1>
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card>
          <h2 className="text-lg font-medium">Set Your Budget</h2>
          <form onSubmit={handleSubmit} className="mt-4 space-y-4">
            <Input
              type="number"
              value={budgetAmount}
              onChange={(e) => setBudgetAmount(e.target.value)}
              placeholder="Enter monthly budget"
              step="0.01"
              required
            />
            <Button type="submit" disabled={mutation.isLoading}>
              {mutation.isLoading ? "Saving..." : "Set Budget"}
            </Button>
          </form>
        </Card>

        <Card>
          <h2 className="text-lg font-medium">Budget Overview</h2>
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="mt-4 space-y-2">
              <p>Budget: {formatCurrency(budget?.amount)}</p>
              <p>Spent: {formatCurrency(dashboard?.monthly_expenses)}</p>
              <p>Remaining: {formatCurrency(dashboard?.budget_remaining)}</p>
              <Suspense
                fallback={
                  <div className="flex h-40 items-center justify-center">
                    <Spinner />
                  </div>
                }
              >
                <BudgetGaugeChart data={chartData} />
              </Suspense>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
};

export default BudgetPage;
