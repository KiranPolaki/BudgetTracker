import React from "react";
import Button from "../ui/Button";
import { BadgeCheck, PiggyBank } from "lucide-react";

const typeMeta = {
  INCOME: {
    label: "Income Categories",
    accent: "text-emerald-400",
    border: "border-emerald-500/40",
    icon: PiggyBank,
  },
  EXPENSE: {
    label: "Expense Categories",
    accent: "text-rose-400",
    border: "border-rose-500/40",
    icon: BadgeCheck,
  },
};

const CategoryGroup = ({ type, categories, onEdit, onDelete }) => {
  const meta = typeMeta[type];
  const Icon = meta.icon;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-2xl shadow-lg overflow-hidden">
      <div className="flex items-center justify-between border-b border-zinc-800 px-6 py-4">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-zinc-800 p-2">
            <Icon className={`${meta.accent} w-5 h-5`} />
          </div>
          <div>
            <p className="text-base font-semibold text-zinc-100">
              {meta.label}
            </p>
            <p className="text-sm text-zinc-500">
              {categories.length}{" "}
              {categories.length === 1 ? "category" : "categories"}
            </p>
          </div>
        </div>
      </div>

      {categories.length === 0 ? (
        <p className="px-6 py-8 text-center text-sm text-zinc-500">
          No {type === "INCOME" ? "income" : "expense"} categories yet.
        </p>
      ) : (
        <div className="max-h-96 overflow-y-auto">
          <ul className="divide-y divide-zinc-800">
            {categories.map((category) => (
              <li
                key={category.id}
                className="flex items-center justify-between px-6 py-4 hover:bg-zinc-800/40 transition"
              >
                <div className="flex flex-col">
                  <span className="text-sm font-semibold text-zinc-100">
                    {category.name}
                  </span>
                  <span className="text-xs text-zinc-500">
                    Created {new Date(category.created_at).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="primary"
                    onClick={() => onEdit(category)}
                    className="px-4 py-1.5 text-sm"
                  >
                    Edit
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => onDelete(category)}
                    className="px-4 py-1.5 text-sm"
                  >
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

const CategoryList = ({ categories, onEdit, onDelete }) => {
  const incomeCategories = categories.filter((cat) => cat.type === "INCOME");
  const expenseCategories = categories.filter((cat) => cat.type === "EXPENSE");

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      <CategoryGroup
        type="INCOME"
        categories={incomeCategories}
        onEdit={onEdit}
        onDelete={onDelete}
      />
      <CategoryGroup
        type="EXPENSE"
        categories={expenseCategories}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
};

export default CategoryList;
