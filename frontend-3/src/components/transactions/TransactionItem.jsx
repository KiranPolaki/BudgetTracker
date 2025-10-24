import React from "react";
import { formatCurrency, formatDate } from "../../lib/utils";

const TransactionItem = ({ transaction }) => {
  const isIncome = transaction.type === "INCOME";
  const amountColor = isIncome ? "text-green-600" : "text-red-600";
  const amountSign = isIncome ? "+" : "-";

  return (
    <li className="py-4">
      <div className="flex items-center space-x-4">
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-gray-900 truncate">
            {transaction.description}
          </p>
          <p className="text-sm text-gray-500 truncate">
            {transaction.category_name} ・ {formatDate(transaction.date)}
          </p>
        </div>
        <div>
          <p className={`text-sm font-semibold ${amountColor}`}>
            {amountSign}
            {formatCurrency(transaction.amount)}
          </p>
        </div>
      </div>
    </li>
  );
};

export default TransactionItem;
