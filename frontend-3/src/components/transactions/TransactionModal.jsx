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
    queryFn: () => getCategories({ paginated: false }),
  });

  const filteredCategories = categoriesData?.results?.filter(
    (cat) => cat.type === formData.type
  );

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
          onChange={handleChange} /* ... */
        >
          <option value="EXPENSE">Expense</option>
          <option value="INCOME">Income</option>
        </select>

        <select
          name="category"
          value={formData.category}
          onChange={handleChange}
          required
        >
          <option value="">Select a category</option>
          {/* Use the filtered list here */}
          {filteredCategories?.map((cat) => (
            <option key={cat.id} value={cat.id}>
              {cat.name}
            </option>
          ))}
        </select>
        {/* Form fields for amount, description, date, type, category dropdown */}
        <Input
          name="amount"
          type="number"
          value={formData.amount}
          onChange={handleChange}
          placeholder="Amount"
          required
        />
        {/* ... other fields */}
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={closeModal}>
            Cancel
          </Button>
          <Button type="submit" disabled={mutation.isLoading}>
            {mutation.isLoading ? "Saving..." : "Save"}
          </Button>
        </div>
      </form>
    </Modal>
  );
};

export default TransactionModal;
