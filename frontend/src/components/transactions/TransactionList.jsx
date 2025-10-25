import React, { useState } from "react";
import TransactionItem from "./TransactionItem";
import { useUiStore } from "../../store/uiStore";
import Button from "../ui/Button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { deleteTransaction } from "../../api/transactions";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import { ArrowUpCircle, ArrowDownCircle } from "lucide-react";

const TransactionList = ({ transactions }) => {
  const { openModal, setEditingTransaction } = useUiStore();
  const queryClient = useQueryClient();
  const [confirmDelete, setConfirmDelete] = useState(null);

  const mutation = useMutation({
    mutationFn: deleteTransaction,
    onSuccess: () => {
      toast.success("Transaction deleted!");
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["dashboard"]);
      setConfirmDelete(null);
    },
    onError: () => toast.error("Failed to delete transaction."),
  });

  const handleEdit = (tx) => {
    setEditingTransaction(tx);
    openModal();
  };

  const handleDelete = () => {
    if (confirmDelete) mutation.mutate(confirmDelete.id);
  };

  if (transactions.length === 0)
    return (
      <p className="text-center text-zinc-500 py-12">No transactions found.</p>
    );

  return (
    <>
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 space-y-4">
        <ul className="divide-y divide-zinc-800">
          {transactions.map((tx) => {
            const isIncome = tx.type === "INCOME";
            return (
              <li
                key={tx.id}
                className="flex items-center justify-between gap-4 py-4 transition rounded-lg"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div
                    className={`w-12 h-12 flex items-center justify-center rounded-full ${
                      isIncome ? "bg-emerald-800" : "bg-rose-800"
                    }`}
                  >
                    {isIncome ? (
                      <ArrowUpCircle className="text-emerald-400 w-6 h-6" />
                    ) : (
                      <ArrowDownCircle className="text-rose-400 w-6 h-6" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-zinc-100 truncate">
                      {tx.description}
                    </p>
                    <p className="text-xs text-zinc-400 truncate">
                      {tx.category_name} ・ {tx.date}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <p
                    className={`w-32 text-right font-mono font-semibold ${
                      isIncome ? "text-emerald-400" : "text-rose-400"
                    }`}
                  >
                    {isIncome ? "+" : "-"}
                    {tx.amount.toLocaleString()}
                  </p>
                  <div className="flex gap-2">
                    <Button variant="primary" onClick={() => handleEdit(tx)}>
                      Edit
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() => setConfirmDelete(tx)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {confirmDelete && (
        <Modal title="Confirm Delete" onClose={() => setConfirmDelete(null)}>
          <p className="text-zinc-300">
            Are you sure you want to delete{" "}
            <strong>{confirmDelete.description}</strong>?
          </p>
          <div className="flex justify-end gap-3 mt-4">
            <Button variant="secondary" onClick={() => setConfirmDelete(null)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </Modal>
      )}
    </>
  );
};

export default TransactionList;
