import React, { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import toast from "react-hot-toast";
import Modal from "../ui/Modal";
import Button from "../ui/Button";
import Input from "../ui/Input";
import { getCategories } from "../../api/category";
import { createTransaction, updateTransaction } from "../../api/transactions";
import { useUiStore } from "../../store/uiStore";

const TransactionModal = () => {
  const queryClient = useQueryClient();
  const { closeModal, editingTransaction } = useUiStore();
  const [formData, setFormData] = useState({
    type: "EXPENSE",
    amount: "",
    description: "",
    category: "",
    date: new Date().toISOString().split("T")[0],
  });

  useEffect(() => {
    if (editingTransaction) {
      setFormData({
        type: editingTransaction.type,
        amount: editingTransaction.amount,
        description: editingTransaction.description,
        category: editingTransaction.category,
        date: editingTransaction.date,
      });
    }
  }, [editingTransaction]);

  const { data: categoriesData } = useQuery({
    queryKey: ["categories"],
    queryFn: () => getCategories(),
  });

  const filteredCategories = categoriesData?.results?.filter(
    (cat) => cat.type === formData.type
  ) || categoriesData?.filter((cat) => cat.type === formData.type);

  const mutation = useMutation({
    mutationFn: editingTransaction
      ? (data) => updateTransaction(editingTransaction.id, data)
      : createTransaction,
    onSuccess: () => {
      toast.success(
        `Transaction ${editingTransaction ? "updated" : "created"}!`
      );
      queryClient.invalidateQueries(["transactions"]);
      queryClient.invalidateQueries(["dashboard"]);
      closeModal();
    },
    onError: () => toast.error("An error occurred."),
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    mutation.mutate({ ...formData, category: parseInt(formData.category) });
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <Modal
      title={editingTransaction ? "Edit Transaction" : "New Transaction"}
      onClose={closeModal}
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <select
          name="type"
          value={formData.type}
          onChange={handleChange}
          className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
          className="w-full rounded-md bg-zinc-900 border border-zinc-700 text-zinc-100 p-2 text-sm focus:ring-blue-500 focus:border-blue-500"
        >
          <option value="">Select a category</option>
          {filteredCategories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>

        <Input
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />

        <Input
          name="description"
          type="text"
          value={formData.description}
          onChange={handleChange}
          placeholder="Description"
          required
        />

        <Input
          name="date"
          type="date"
          value={formData.date}
          onChange={handleChange}
          required
        />

        <div className="flex justify-end gap-2 mt-4">
          <Button
            type="button"
            variant="secondary"
            onClick={closeModal}
            disabled={mutation.isLoading}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            loading={mutation.isLoading}
            disabled={mutation.isLoading}
          >
            {mutation.isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
