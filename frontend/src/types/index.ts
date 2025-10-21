export interface User {
  id: number;
  username: string;
  token?: string;
}

export interface Category {
  id: number;
  name: string;
  type: "INCOME" | "EXPENSE";
}

export interface Transaction {
  id: number;
  amount: number;
  description: string;
  date: string;
  category: Category;
  type: "INCOME" | "EXPENSE";
}

export interface Budget {
  id: number;
  amount: number;
  month: string;
  category: Category;
}

export interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface FinancialSummary {
  totalIncome: number;
  totalExpenses: number;
  balance: number;
  monthlyBudget: number;
  budgetUsage: number;
}
