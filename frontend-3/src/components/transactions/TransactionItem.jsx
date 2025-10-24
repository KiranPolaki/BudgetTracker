import React from "react";
import { formatCurrency, formatDate } from "../../lib/utils";

const TransactionItem = ({ transaction }) => {
  const isIncome = transaction.type === "INCOME";
  const amountColor = isIncome ? "text-emerald-400" : "text-rose-400";
  const amountSign = isIncome ? "+" : "-";

  return (
    <div className="flex items-center justify-between w-full">
      <div>
        <p className="text-sm font-medium text-zinc-100">
          {transaction.description}
        </p>
        <p className="text-xs text-zinc-500">
          {transaction.category_name} • {formatDate(transaction.date)}
        </p>
      </div>
      <p className={`text-sm font-semibold ${amountColor}`}>
        {amountSign}
        {formatCurrency(transaction.amount)}
      </p>
    </div>
  );
};

export default TransactionItem;
