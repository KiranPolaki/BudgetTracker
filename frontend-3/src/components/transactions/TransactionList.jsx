import React from "react";
import TransactionItem from "./TransactionItem";
import { useUiStore } from "../../store/uiStore";
import Button from "../ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTransaction } from "../../api/transactions";
import toast from "react-hot-toast";

const TransactionList = ({ transactions }) => {
  const { openModal, setEditingTransaction } = useUiStore();
  const queryClient = useQueryClient();

  const mutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success("Transaction deleted!");
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["dashboard"]);
    },
    onError: () => {
      toast.error("Failed to delete transaction.");
    },
  });

  const handleEdit = (transaction) => {
    setEditingTransaction(transaction);
    openModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to delete this transaction?")) {
      mutation.mutate(id);
    }
  };

  if (transactions.length === 0) {
    return <p className="text-center text-gray-500">No transactions found.</p>;
  }

  return (
    <div className="flow-root">
      <ul role="list" className="-my-5 divide-y divide-gray-200">
        {transactions.map((tx) => (
          <li key={tx.id} className="py-5">
            <div className="flex items-center space-x-4">
              <div className="flex-1">
                <TransactionItem transaction={tx} />
              </div>
              <div className="flex items-center space-x-2">
                <Button variant="secondary" onClick={() => handleEdit(tx)}>
                  Edit
                </Button>
                <Button variant="secondary" onClick={() => handleDelete(tx.id)}>
                  Delete
                </Button>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default TransactionList;
